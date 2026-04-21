/**
 * Upload Controller - Production Ready
 * Handles Excel/CSV file uploads with in-memory storage
 * Features:
 * - Memory-based file processing (no disk junk)
 * - Comprehensive validation
 * - Performance data calculation
 * - Data management (clear/reset)
 */

const Agent = require('../models/Agent');
const UploadHistory = require('../models/UploadHistory');
const logger = require('../utils/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { parseExcelBuffer, validateFileMetadata } = require('../services/excelService');

/**
 * Calculate SHA256 hash of buffer for duplicate detection
 * @param {Buffer} buffer - File buffer
 * @returns {string} - Hex hash
 */
function calculateBufferHash(buffer) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Detect data date from request or filename
 * @param {object} metadata - dataDate from request, fileName
 * @returns {Date} - Detected date
 */
function detectDataDate(metadata = {}) {
  if (metadata.dataDate && metadata.dataDate instanceof Date) {
    return new Date(metadata.dataDate);
  }

  if (metadata.fileName) {
    const dateMatch = metadata.fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const date = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * POST /api/uploads/performance
 * Upload and process performance data from Excel/CSV file (IN-MEMORY)
 * No files saved to disk - all processing in memory
 *
 * Multipart form-data:
 * - file: Excel/CSV file (.xlsx, .xls, .csv)
 * - dataDate (optional): YYYY-MM-DD format
 * - overwriteDate (optional): true/false to overwrite existing date data
 *
 * Returns:
 * {
 *   success: boolean,
 *   message: string,
 *   recordsProcessed: number,
 *   uploadId: string,
 *   data: [{name, performanceScore, ...}]
 * }
 */
exports.uploadPerformanceData = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  // 1. Validate file exists
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded. Please provide an Excel/CSV file.');
  }

  logger.info('Upload started', {
    fileName: req.file.originalname,
    size: req.file.size,
  });

  try {
    // 2. Validate file metadata
    const metadataValidation = validateFileMetadata(req.file.originalname);
    if (!metadataValidation.valid) {
      const errorMessages = metadataValidation.errors.map((e) => e.message).join('; ');
      throw new ApiError(400, errorMessages);
    }

    // 3. Check file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (req.file.size > MAX_FILE_SIZE) {
      throw new ApiError(400, `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // 4. Calculate hash for duplicate detection (from buffer, no file needed!)
    const fileHash = calculateBufferHash(req.file.buffer);
    const dataDate = detectDataDate({
      dataDate: req.body.dataDate ? new Date(req.body.dataDate) : null,
      fileName: req.file.originalname,
    });

    // 5. Check for duplicates
    const existingUpload = await UploadHistory.findOne({ fileHash });
    if (existingUpload && req.body.allowDuplicates !== 'true' && req.body.allowDuplicates !== true) {
      logger.warn('Duplicate upload detected', {
        hash: fileHash,
        date: dataDate,
        previousUpload: existingUpload._id,
      });

      throw new ApiError(409, 'This file has already been uploaded previously', {
        isDuplicate: true,
        previousUploadId: existingUpload._id,
        previousUploadDate: existingUpload.uploadDate,
      });
    }

    // 6. Parse Excel directly from buffer (NO DISK STORAGE!)
    const parseResult = parseExcelBuffer(req.file.buffer, req.file.originalname);

    if (!parseResult.success) {
      const errors = parseResult.errors.filter((e) => e.severity === 'critical');
      const errorMessages = errors.map((e) => e.message).join('; ');

      // Create failed upload record
      await UploadHistory.create({
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileHash,
        uploadedBy: req.user?.id || 'anonymous',
        uploadDate: new Date(),
        dataDate,
        status: 'failed',
        format: req.file.originalname.split('.').pop().toLowerCase(),
        recordsProcessed: 0,
        errors: parseResult.errors,
        processingTime: Date.now() - startTime,
      });

      throw new ApiError(400, errorMessages, {
        errors: parseResult.errors,
        warnings: parseResult.warnings,
      });
    }

    const agentRecords = parseResult.data;

    // 7. Handle overwrite flag
    if (req.body.overwriteDate === 'true' || req.body.overwriteDate === true) {
      const startOfDay = new Date(dataDate.getFullYear(), dataDate.getMonth(), dataDate.getDate());
      const endOfDay = new Date(dataDate.getFullYear(), dataDate.getMonth(), dataDate.getDate() + 1);

      const deleteResult = await Agent.deleteMany({
        date: { $gte: startOfDay, $lt: endOfDay },
      });

      logger.info('Overwritten existing records', {
        date: dataDate,
        deletedCount: deleteResult.deletedCount,
      });
    }

    // 8. Insert or update records (upsert)
    const results = [];
    for (const record of agentRecords) {
      const result = await Agent.findOneAndUpdate(
        {
          name: record.name,
          date: {
            $gte: new Date(dataDate.getFullYear(), dataDate.getMonth(), dataDate.getDate()),
            $lt: new Date(dataDate.getFullYear(), dataDate.getMonth(), dataDate.getDate() + 1),
          },
        },
        {
          name: record.name,
          date: dataDate,
          talkTime: record.talkTime,
          loggedInTime: record.loggedInTime,
          breakTime: record.breakTime,
          performanceScore: record.performanceScore,
        },
        { upsert: true, new: true }
      );
      results.push(result);
    }

    // 9. Create upload history record
    const uploadRecord = await UploadHistory.create({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileHash,
      uploadedBy: req.user?.id || 'anonymous',
      uploadDate: new Date(),
      dataDate,
      status: parseResult.errors.length === 0 ? 'success' : 'partial_success',
      format: req.file.originalname.split('.').pop().toLowerCase(),
      recordsProcessed: results.length,
      errors: parseResult.errors,
      warnings: parseResult.warnings,
      processingTime: Date.now() - startTime,
    });

    logger.info('Upload completed successfully', {
      uploadId: uploadRecord._id,
      recordsProcessed: results.length,
      processingTime: `${Date.now() - startTime}ms`,
      fileName: req.file.originalname,
    });

    // 10. Return success response
    res.status(201).json({
      success: true,
      message: `Successfully processed ${results.length} agent records from Excel file`,
      recordsProcessed: results.length,
      uploadId: uploadRecord._id,
      dataDate,
      warnings: parseResult.warnings,
      processingTime: `${Date.now() - startTime}ms`,
      data: results.map((r) => ({
        id: r._id,
        name: r.name,
        performanceScore: r.performanceScore,
        talkTime: r.talkTime,
        loggedInTime: r.loggedInTime,
        breakTime: r.breakTime,
      })),
    });
  } catch (error) {
    // Error is already handled by asyncHandler, just log it
    logger.error('Upload processing error', {
      error: error.message,
      file: req.file.originalname,
      processingTime: `${Date.now() - startTime}ms`,
    });
    throw error;
  }
});

/**
 * DELETE /api/uploads/clear
 * Clear all performance data from database
 * WARNING: This is a destructive operation!
 *
 * Query parameters:
 * - confirm: true (required to proceed)
 * - dataDate (optional): Only clear data for specific date (YYYY-MM-DD)
 *
 * Returns:
 * {
 *   success: boolean,
 *   message: string,
 *   deletedCount: number,
 *   clearedDate?: string (if specific date)
 * }
 */
exports.clearPerformanceData = asyncHandler(async (req, res) => {
  // Require confirmation to prevent accidental deletion
  if (req.query.confirm !== 'true') {
    throw new ApiError(400, 'Confirmation required. Use ?confirm=true to proceed with data deletion.');
  }

  try {
    let deleteResult;
    let message;
    let clearedScope;

    // Option 1: Clear specific date
    if (req.query.dataDate) {
      const targetDate = new Date(req.query.dataDate);
      if (isNaN(targetDate.getTime())) {
        throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');
      }

      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

      deleteResult = await Agent.deleteMany({
        date: { $gte: startOfDay, $lt: endOfDay },
      });

      message = `Cleared all agent records for date: ${req.query.dataDate}`;
      clearedScope = 'specific_date';
    }
    // Option 2: Clear all data
    else {
      deleteResult = await Agent.deleteMany({});
      message = 'Cleared all agent records from database';
      clearedScope = 'all_data';
    }

    logger.warn('Performance data cleared', {
      scope: clearedScope,
      deletedCount: deleteResult.deletedCount,
      date: req.query.dataDate,
    });

    res.status(200).json({
      success: true,
      message,
      deletedCount: deleteResult.deletedCount,
      clearedScope,
      warning: '⚠️ Data has been permanently deleted',
    });
  } catch (error) {
    logger.error('Clear data error', {
      error: error.message,
      scope: req.query.dataDate ? 'specific_date' : 'all_data',
    });
    throw error;
  }
});

/**
 * GET /api/uploads/history
 * Get upload history
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 20)
 * - status: Filter by status (success, partial_success, failed)
 *
 * Returns:
 * {
 *   success: boolean,
 *   data: [{...uploadRecord}],
 *   pagination: {page, limit, total, pages}
 * }
 */
exports.getUploadHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const uploads = await UploadHistory.find(filter)
    .sort({ uploadDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await UploadHistory.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: uploads,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

module.exports = exports;
