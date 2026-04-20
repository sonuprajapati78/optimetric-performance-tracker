/**
 * Upload Controller
 * Responsibility: ONLY orchestrate request/response
 * - Extract data from request
 * - Call appropriate services
 * - Format and send response
 * Does NOT contain business logic
 */

const logger = require('../utils/logger');
const { generateFileHash } = require('../utils/fileUtils');
const { parseDate, getStartOfDay, getEndOfDay, extractDateFromFileName } = require('../utils/dateUtils');

const excelParserService = require('../services/excelParserService');
const dataValidationService = require('../services/dataValidationService');
const performanceCalculationService = require('../services/performanceCalculationService');
const databaseService = require('../services/databaseService');

// CLEAN FILE - REMOVE OLD CODE AFTER THIS POINT

/**
 * POST /api/uploads/performance
 * Upload Excel file and process performance data
 */
async function uploadPerformanceData(req, res) {
  try {
    const startTime = Date.now();
    const { dataDate, overwriteDate, allowDuplicates } = req.body;
    const file = req.file;

    logger.info('Upload started', { fileName: file.originalname, size: file.size });

    // Step 1: Validate Excel format
    if (!excelParserService.isValidExcelBuffer(file.buffer)) {
      logger.warn('Invalid Excel buffer');
      return res.status(400).json({
        success: false,
        error: 'Invalid Excel file format',
        code: 'INVALID_EXCEL',
      });
    }

    // Step 2: Parse Excel to JSON
    let rawData;
    try {
      rawData = excelParserService.parseExcelToJson(file.buffer);
    } catch (error) {
      logger.error('Excel parsing failed', { error: error.message });
      return res.status(400).json({
        success: false,
        error: 'Failed to parse Excel file: ' + error.message,
        code: 'PARSE_ERROR',
      });
    }

    // Step 3: Validate data structure
    const validation = dataValidationService.validateDataStructure(rawData);
    if (!validation.valid) {
      logger.warn('Data validation failed', { validation });
      return res.status(400).json({
        success: false,
        error: 'Data validation failed',
        code: 'VALIDATION_FAILED',
        details: {
          errors: validation.errors,
          invalidRows: validation.invalidRows,
        },
      });
    }

    // Step 4: Calculate performance metrics
    let performanceRecords;
    try {
      performanceRecords = performanceCalculationService.transformToPerformanceRecords(rawData);
    } catch (error) {
      logger.error('Performance calculation failed', { error: error.message });
      return res.status(500).json({
        success: false,
        error: 'Performance calculation failed',
        code: 'CALCULATION_ERROR',
      });
    }

    // Step 5: Detect data date
    const detectedDate =
      dataDate ||
      extractDateFromFileName(file.originalname) ||
      new Date();
    const normalizedDate = parseDate(detectedDate);

    logger.info('Processing data for date', {
      detectedDate: detectedDate,
      normalizedDate: normalizedDate.toISOString(),
    });

    // Step 6: Check for duplicates (optional)
    const fileHash = generateFileHash(file.buffer);
    if (!allowDuplicates) {
      try {
        const uploadHistory = await databaseService.getUploadHistory(1, 100);
        const isDuplicate = uploadHistory.records.some((h) => h.fileHash === fileHash);
        if (isDuplicate) {
          logger.warn('Duplicate file detected', { fileHash });
          return res.status(409).json({
            success: false,
            error: 'Duplicate file already uploaded',
            code: 'DUPLICATE_FILE',
          });
        }
      } catch (error) {
        logger.warn('Duplicate check failed, proceeding', { error: error.message });
      }
    }

    // Step 7: Handle overwrite flag
    if (overwriteDate) {
      const startOfDay = getStartOfDay(normalizedDate);
      const endOfDay = getEndOfDay(normalizedDate);

      try {
        await databaseService.deleteAgentRecordsByDate(startOfDay, endOfDay);
        logger.warn('Existing records overwritten', { date: normalizedDate });
      } catch (error) {
        logger.error('Overwrite operation failed', { error: error.message });
        return res.status(500).json({
          success: false,
          error: 'Failed to overwrite existing data',
          code: 'OVERWRITE_ERROR',
        });
      }
    }

    // Step 8: Upsert records to database
    let upsertResult;
    try {
      upsertResult = await databaseService.upsertAgentRecords(
        performanceRecords,
        normalizedDate
      );
    } catch (error) {
      logger.error('Database upsert failed', { error: error.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to save data to database',
        code: 'DATABASE_ERROR',
      });
    }

    // Step 9: Save upload history
    const processingTime = Date.now() - startTime;
    try {
      await databaseService.saveUploadHistory({
        fileName: file.originalname,
        fileSize: file.size,
        fileHash,
        status: 'SUCCESS',
        recordsProcessed: performanceRecords.length,
        recordsInserted: upsertResult.inserted,
        recordsUpdated: upsertResult.updated,
        recordsFailed: upsertResult.failed,
        uploadDate: new Date(),
        processingTime,
        dataDate: normalizedDate,
      });
    } catch (error) {
      logger.error('Failed to save upload history', { error: error.message });
      // Don't fail the whole request, just log
    }

    // Step 10: Calculate statistics
    const stats = performanceCalculationService.calculateStatistics(performanceRecords);

    logger.info('Upload completed successfully', {
      recordsProcessed: performanceRecords.length,
      processingTime,
      stats,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Performance data uploaded successfully',
      data: {
        recordsProcessed: performanceRecords.length,
        recordsInserted: upsertResult.inserted,
        recordsUpdated: upsertResult.updated,
        recordsFailed: upsertResult.failed,
        dataDate: normalizedDate.toISOString().split('T')[0],
        processingTime: `${processingTime}ms`,
        statistics: stats,
        records: performanceRecords.slice(0, 10), // Return first 10 for preview
      },
    });
  } catch (error) {
    logger.error('Upload endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Upload processing failed',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * DELETE /api/uploads/clear
 * Clear performance data
 * Query params: confirm=true (required), dataDate=YYYY-MM-DD (optional)
 */
async function clearPerformanceData(req, res) {
  try {
    const { dataDate } = req.query;

    logger.warn('Clear request initiated', { dataDate });

    let deleteResult;

    if (dataDate) {
      // Delete specific date only
      const date = parseDate(dataDate);
      const startOfDay = getStartOfDay(date);
      const endOfDay = getEndOfDay(date);

      try {
        deleteResult = await databaseService.deleteAgentRecordsByDate(startOfDay, endOfDay);
        logger.error('Data cleared for specific date', {
          date: dataDate,
          deletedCount: deleteResult.deletedCount,
        });
      } catch (error) {
        logger.error('Delete by date failed', { error: error.message });
        return res.status(500).json({
          success: false,
          error: 'Failed to delete data',
          code: 'DELETE_ERROR',
        });
      }
    } else {
      // Delete ALL data
      try {
        deleteResult = await databaseService.deleteAllAgentRecords();
        logger.error('ALL DATA CLEARED', {
          deletedCount: deleteResult.deletedCount,
        });
      } catch (error) {
        logger.error('Delete all failed', { error: error.message });
        return res.status(500).json({
          success: false,
          error: 'Failed to delete all data',
          code: 'DELETE_ERROR',
        });
      }
    }

    // Save to upload history for audit trail
    try {
      await databaseService.saveUploadHistory({
        fileName: 'MANUAL_DELETE',
        fileSize: 0,
        fileHash: 'N/A',
        status: 'DELETED',
        recordsProcessed: 0,
        recordsInserted: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        uploadDate: new Date(),
        processingTime: 0,
        dataDate: dataDate ? parseDate(dataDate) : null,
      });
    } catch (error) {
      logger.warn('Failed to save delete to history', { error: error.message });
    }

    res.status(200).json({
      success: true,
      message: `Deleted ${deleteResult.deletedCount} records`,
      data: {
        deletedCount: deleteResult.deletedCount,
        clearedScope: dataDate ? `Date: ${dataDate}` : 'All data',
        warning: 'This operation is permanent and cannot be undone',
      },
    });
  } catch (error) {
    logger.error('Clear endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Clear operation failed',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/uploads/history
 * Get upload history
 * Query params: page=1, limit=20, status=SUCCESS|FAILED
 */
async function getUploadHistory(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const status = req.query.status || null;

    logger.info('Upload history requested', { page, limit, status });

    try {
      const result = await databaseService.getUploadHistory(page, limit, status);

      res.status(200).json({
        success: true,
        data: result.records,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Failed to retrieve history', { error: error.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve upload history',
        code: 'DATABASE_ERROR',
      });
    }
  } catch (error) {
    logger.error('History endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'History retrieval failed',
      code: 'SERVER_ERROR',
    });
  }
};

module.exports = {
  uploadPerformanceData,
  clearPerformanceData,
  getUploadHistory,
};
