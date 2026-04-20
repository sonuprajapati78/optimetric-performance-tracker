/**
 * Multer Configuration Middleware
 * Responsibility: Configure multer for in-memory file upload ONLY
 * - Setup memory storage
 * - Setup file filter
 * - Setup size limits
 * Does NOT validate content, only handles multer setup
 */

const multer = require('multer');
const logger = require('../utils/logger');

/**
 * Multer Configuration: IN-MEMORY STORAGE
 * Files stay in RAM as Buffer objects
 * Available at req.file.buffer
 * No temporary files on disk
 */
const storage = multer.memoryStorage();

/**
 * File filter: Extension-based check ONLY
 * This is a FIRST-PASS filter
 * Detailed validation happens in validateFileBeforeUpload middleware
 */
const fileFilter = (req, file, cb) => {
  const fileName = file.originalname;
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];

  if (allowedExtensions.includes(ext)) {
    logger.info('Multer fileFilter: File accepted', { fileName, ext });
    cb(null, true);
  } else {
    const error = new Error(`Invalid file type: ${ext}`);
    logger.warn('Multer fileFilter: File rejected', { fileName, ext });
    cb(error);
  }
};

/**
 * Multer instance with memory storage
 * Max file size: 10MB
 * Only Excel/CSV files allowed
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Only 1 file per request
  },
});

/**
 * Middleware: Handle multer-specific errors
 * Multer errors have specific codes
 * Transform them to application-standard error format
 */
const multerErrorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }

  // Handle specific multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    logger.warn('Multer: File too large', { limit: 10 * 1024 * 1024 });
    return res.status(413).json({
      success: false,
      error: 'File size exceeds 10MB limit',
      code: 'FILE_TOO_LARGE',
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    logger.warn('Multer: Too many files');
    return res.status(400).json({
      success: false,
      error: 'Only 1 file allowed per request',
      code: 'TOO_MANY_FILES',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    logger.warn('Multer: Unexpected file field');
    return res.status(400).json({
      success: false,
      error: 'Unexpected file field',
      code: 'UNEXPECTED_FILE',
    });
  }

  // Handle file filter errors
  if (err.message && err.message.includes('Invalid file type')) {
    logger.warn('Multer: Invalid file type error', { message: err.message });
    return res.status(400).json({
      success: false,
      error: err.message,
      code: 'INVALID_FILE_TYPE',
    });
  }

  // Generic multer error
  logger.error('Multer error', { code: err.code, message: err.message });
  return res.status(400).json({
    success: false,
    error: 'File upload failed: ' + err.message,
    code: 'FILE_UPLOAD_ERROR',
  });
};

module.exports = {
  upload,
  multerErrorHandler,
};
