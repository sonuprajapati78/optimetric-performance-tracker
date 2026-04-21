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

/**
 * POST /api/uploads/performance
 * Upload Excel/CSV file and process performance data
 */
async function uploadPerformanceData(req, res) {
  let startTime = null;
  let file = null;

  try {
    startTime = Date.now();
    file = req.file;

    // Defensive check for file
    if (!file) {
      logger.error('File not found in request object');
      return res.status(400).json({
        success: false,
        error: 'No file found in request',
        code: 'NO_FILE',
      });
    }

    if (!file.buffer) {
      logger.error('File buffer not found');
      return res.status(400).json({
        success: false,
        error: 'File buffer is empty',
        code: 'EMPTY_BUFFER',
      });
    }

    const { dataDate, overwriteDate, allowDuplicates } = req.body || {};

    logger.info('Upload started', {
      fileName: file.originalname,
      size: file.size,
      hasBuffer: !!file.buffer,
    });

    // Step 1: Validate file format
    if (!excelParserService.isValidExcelBuffer(file.buffer)) {
      logger.warn('Invalid file format', { fileName: file.originalname });
      return res.status(400).json({
        success: false,
        error: 'Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file.',
        code: 'INVALID_FILE_FORMAT',
        details: {
          receivedFile: file.originalname,
          acceptedFormats: ['.xlsx', '.xls', '.csv'],
          bufferSize: file.buffer.length,
        },
      });
    }

    // Step 2: Parse Excel/CSV to JSON
    let rawData;
    try {
      rawData = excelParserService.parseExcelToJson(file.buffer);
      logger.info('File parsed successfully', {
        rowCount: rawData.length,
      });
    } catch (error) {
      logger.error('File parsing failed', {
        error: error.message,
        stack: error.stack,
      });
      return res.status(400).json({
        success: false,
        error: 'Failed to parse file: ' + error.message,
        code: 'PARSE_ERROR',
        details: {
          fileName: file.originalname,
          parseError: error.message,
        },
      });
    }

    // Step 3: Validate data structure
    const validation = dataValidationService.validateDataStructure(rawData);
    if (!validation.valid) {
      logger.warn('Data validation failed', {
        fileName: file.originalname,
        validation,
      });
      return res.status(400).json({
        success: false,
        error: 'Data validation failed. Check your file format.',
        code: 'VALIDATION_FAILED',
        details: {
          errors: validation.errors,
          invalidRows: validation.invalidRows.slice(0, 5),
          rowsChecked: validation.rowsChecked,
          rowsValid: validation.rowsValid,
        },
      });
    }

    // Step 4: Calculate performance metrics
    let performanceRecords;
    try {
      performanceRecords = performanceCalculationService.transformToPerformanceRecords(rawData);
      logger.info('Performance records created', {
        recordCount: performanceRecords.length,
      });
    } catch (error) {
      logger.error('Performance calculation failed', {
        error: error.message,
        stack: error.stack,
      });
      return res.status(400).json({
        success: false,
        error: 'Performance calculation failed: ' + error.message,
        code: 'CALCULATION_ERROR',
        details: {
          error: error.message,
        },
      });
    }

    // Step 5: Detect data date
    let detectedDate = dataDate;
    if (!detectedDate) {
      detectedDate = extractDateFromFileName(file.originalname) || new Date();
    }

    let normalizedDate;
    try {
      normalizedDate = parseDate(detectedDate);
      logger.info('Date detected', {
        input: detectedDate,
        normalized: normalizedDate.toISOString(),
      });
    } catch (error) {
      logger.error('Date parsing failed', {
        error: error.message,
        input: detectedDate,
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid date provided: ' + error.message,
        code: 'DATE_PARSE_ERROR',
      });
    }

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
        logger.warn('Duplicate check failed, proceeding anyway', {
          error: error.message,
        });
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
        logger.error('Overwrite operation failed', {
          error: error.message,
          stack: error.stack,
        });
        return res.status(500).json({
          success: false,
          error: 'Failed to overwrite existing data: ' + error.message,
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

      logger.info('Database upsert completed', {
        inserted: upsertResult.inserted,
        updated: upsertResult.updated,
        failed: upsertResult.failed,
      });
    } catch (error) {
      logger.error('Database upsert failed', {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        error: 'Failed to save data to database: ' + error.message,
        code: 'DATABASE_ERROR',
        details: {
          error: error.message,
        },
      });
    }

    // Step 9: Save upload history
    const processingTime = Date.now() - startTime;
    try {
      // Extract file format from filename
      const fileExt = file.originalname.toLowerCase().split('.').pop();
      const format = ['xlsx', 'xls', 'csv'].includes(fileExt) ? fileExt : 'csv';

      // Get uploader ID from authenticated user (if available)
      const uploadedBy = req.user?.id || null;

      const historyData = {
        fileName: file.originalname,
        fileSize: file.size,
        fileHash,
        format,
        uploadedBy,
        status: 'success', // lowercase - matches enum
        recordsProcessed: performanceRecords.length,
        recordsSkipped: 0,
        recordsFailed: upsertResult.failed,
        uploadDate: new Date(),
        dataDate: normalizedDate,
        totalRowsInFile: rawData.length,
        validRowsCount: performanceRecords.length,
        isDuplicate: false,
        errors: upsertResult.errors || [],
      };

      await databaseService.saveUploadHistory(historyData);

      logger.info('Upload history saved', {
        fileName: file.originalname,
        format,
      });
    } catch (error) {
      logger.warn('Failed to save upload history (non-critical)', {
        error: error.message,
        stack: error.stack,
      });
      // Don't fail the request for history saving failure
    }

    // Step 10: Calculate statistics
    const stats = performanceCalculationService.calculateStatistics(performanceRecords);

    logger.info('Upload completed successfully', {
      recordsProcessed: performanceRecords.length,
      processingTime,
      stats,
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Performance data uploaded successfully',
      data: {
        upload: {
          fileName: file.originalname,
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          uploadedAt: new Date().toISOString(),
        },
        processing: {
          dataDate: normalizedDate.toISOString().split('T')[0],
          processingTime: `${processingTime}ms`,
          recordsProcessed: performanceRecords.length,
        },
        database: {
          recordsInserted: upsertResult.inserted,
          recordsUpdated: upsertResult.updated,
          recordsFailed: upsertResult.failed,
        },
        statistics: stats,
        records: performanceRecords.map((r) => ({
          name: r.name,
          performanceScore: r.performanceScore,
          talkTime: r.raw.talkTime,
          loggedInTime: r.raw.loggedInTime,
          breakTime: r.raw.breakTime,
        })),
      },
    });
  } catch (error) {
    // Catch-all for any unhandled errors
    logger.error('Unexpected error in upload controller', {
      error: error.message,
      stack: error.stack,
      code: error.code,
    });

    // Only send response if not already sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Unexpected error: ' + (error.message || 'Unknown error'),
        code: 'UNEXPECTED_ERROR',
        details: {
          errorType: error.name,
          file: file ? file.originalname : 'No file',
        },
      });
    }

    throw error; // Re-throw so route handler can log it
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
