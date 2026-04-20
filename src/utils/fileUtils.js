/**
 * File Utilities
 * Helper functions for file operations
 */

const crypto = require('crypto');
const logger = require('./logger');

/**
 * Generate SHA256 hash from buffer
 * Used for duplicate detection
 * @param {Buffer} buffer - File buffer
 * @returns {string} SHA256 hex hash
 */
function generateFileHash(buffer) {
  try {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch (error) {
    logger.error('Hash generation failed', { error: error.message });
    throw error;
  }
}

/**
 * Extract file extension from filename
 * @param {string} fileName - Original filename
 * @returns {string} Extension with dot (e.g., '.xlsx')
 */
function getFileExtension(fileName) {
  if (!fileName) return '';
  return fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
}

/**
 * Get file extension type
 * @param {string} fileName - Original filename
 * @returns {string} Type: 'xlsx' | 'xls' | 'csv'
 */
function getFileType(fileName) {
  const ext = getFileExtension(fileName);
  switch (ext) {
    case '.xlsx':
      return 'xlsx';
    case '.xls':
      return 'xls';
    case '.csv':
      return 'csv';
    default:
      return 'unknown';
  }
}

module.exports = {
  generateFileHash,
  getFileExtension,
  getFileType,
};
