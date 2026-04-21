/**
 * Multer Configuration - Production
 * 
 * Features:
 * - In-memory storage (no disk writes)
 * - File extension validation
 * - Size limits (10MB max)
 * - Beginner-friendly setup
 */

const multer = require('multer');
const logger = require('../utils/logger');
const { ALLOWED_FILE_EXTENSIONS, DEFAULT_MAX_FILE_SIZE } = require('../constants');

// ======================
// Memory Storage Setup
// ======================
/**
 * Files stored in RAM as Buffer objects
 * Available at: req.file.buffer
 * Advantage: No temporary files on disk, automatic cleanup
 */
const storage = multer.memoryStorage();

// ======================
// File Filter
// ======================
/**
 * Validate file extension before upload
 * Allowed: .xlsx, .csv
 */
const fileFilter = (req, file, cb) => {
  const fileName = file.originalname;
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  if (ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    logger.info('✓ File accepted', { fileName, ext });
    cb(null, true);
  } else {
    logger.warn('✗ File rejected - invalid extension', { fileName, ext });
    const error = new Error(`Invalid file type: ${ext}. Allowed: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`);
    cb(error);
  }
};

// ======================
// Multer Instance
// ======================
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: DEFAULT_MAX_FILE_SIZE, // 10MB
    files: 1, // Only 1 file per request
  },
});

module.exports = upload;
