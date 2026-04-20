/**
 * File Validation Middleware
 * Responsibility: File format validation ONLY
 * - Validates file extension
 * - Checks file size
 * - Validates file is actually present
 * Does NOT parse or process file content
 */

const logger = require('../utils/logger');

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Middleware: Validate file exists and has correct extension
 * Runs BEFORE multer processes the file
 */
const validateFileBeforeUpload = (req, res, next) => {
  try {
    // Check if file exists in request
    if (!req.file) {
      logger.warn('No file provided in request');
      return res.status(400).json({
        success: false,
        error: 'No file provided',
        code: 'NO_FILE_PROVIDED',
      });
    }

    // Check file size
    if (req.file.size > MAX_FILE_SIZE) {
      logger.warn('File size exceeds limit', {
        fileName: req.file.originalname,
        size: req.file.size,
        limit: MAX_FILE_SIZE,
      });
      return res.status(413).json({
        success: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        code: 'FILE_TOO_LARGE',
      });
    }

    // Check file extension
    const fileExt = req.file.originalname
      .substring(req.file.originalname.lastIndexOf('.'))
      .toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      logger.warn('Invalid file extension', {
        fileName: req.file.originalname,
        ext: fileExt,
        allowed: ALLOWED_EXTENSIONS,
      });
      return res.status(400).json({
        success: false,
        error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        code: 'INVALID_FILE_TYPE',
      });
    }

    // File is valid, pass to next middleware
    logger.info('File validation passed', {
      fileName: req.file.originalname,
      size: req.file.size,
      ext: fileExt,
    });

    next();
  } catch (error) {
    logger.error('File validation middleware error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'File validation failed',
      code: 'VALIDATION_ERROR',
    });
  }
};

/**
 * Middleware: Validate request body for upload metadata
 */
const validateUploadMetadata = (req, res, next) => {
  try {
    const { dataDate, overwriteDate, allowDuplicates } = req.body;

    // Validate dataDate format if provided
    if (dataDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dataDate)) {
        logger.warn('Invalid dataDate format', { dataDate });
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT',
        });
      }

      const date = new Date(dataDate);
      if (isNaN(date.getTime())) {
        logger.warn('Invalid date value', { dataDate });
        return res.status(400).json({
          success: false,
          error: 'Invalid date value',
          code: 'INVALID_DATE_VALUE',
        });
      }
    }

    // Validate boolean flags if provided
    if (overwriteDate !== undefined && typeof overwriteDate !== 'boolean') {
      logger.warn('Invalid overwriteDate type', { overwriteDate });
      return res.status(400).json({
        success: false,
        error: 'overwriteDate must be boolean',
        code: 'INVALID_TYPE',
      });
    }

    if (allowDuplicates !== undefined && typeof allowDuplicates !== 'boolean') {
      logger.warn('Invalid allowDuplicates type', { allowDuplicates });
      return res.status(400).json({
        success: false,
        error: 'allowDuplicates must be boolean',
        code: 'INVALID_TYPE',
      });
    }

    // Metadata is valid
    logger.info('Upload metadata validation passed', {
      dataDate,
      overwriteDate,
      allowDuplicates,
    });

    next();
  } catch (error) {
    logger.error('Metadata validation middleware error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Metadata validation failed',
      code: 'VALIDATION_ERROR',
    });
  }
};

/**
 * Middleware: Validate delete request parameters
 */
const validateDeleteRequest = (req, res, next) => {
  try {
    const { confirm, dataDate } = req.query;

    // confirm parameter is REQUIRED for safety
    if (confirm !== 'true') {
      logger.warn('Delete request without confirmation', { confirm });
      return res.status(400).json({
        success: false,
        error: 'Delete requires ?confirm=true query parameter for safety',
        code: 'CONFIRMATION_REQUIRED',
      });
    }

    // Validate dataDate format if provided
    if (dataDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dataDate)) {
        logger.warn('Invalid dataDate format in delete request', { dataDate });
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT',
        });
      }

      const date = new Date(dataDate);
      if (isNaN(date.getTime())) {
        logger.warn('Invalid date value in delete request', { dataDate });
        return res.status(400).json({
          success: false,
          error: 'Invalid date value',
          code: 'INVALID_DATE_VALUE',
        });
      }
    }

    logger.info('Delete request validation passed', { dataDate });
    next();
  } catch (error) {
    logger.error('Delete validation middleware error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Delete validation failed',
      code: 'VALIDATION_ERROR',
    });
  }
};

module.exports = {
  validateFileBeforeUpload,
  validateUploadMetadata,
  validateDeleteRequest,
};
