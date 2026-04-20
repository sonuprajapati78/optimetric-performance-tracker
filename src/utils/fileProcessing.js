const crypto = require('crypto');
const fs = require('fs');

/**
 * Calculate SHA256 hash of a file for deduplication
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - SHA256 hash of the file
 */
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('error', (err) => reject(err));
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/**
 * Detect the data date from file metadata or use current date
 * @param {object} fileMetadata - File metadata (name, uploadDate, custom date)
 * @returns {Date} - Detected date
 */
function detectDataDate(fileMetadata = {}) {
  // If custom date provided, use it
  if (fileMetadata.dataDate && fileMetadata.dataDate instanceof Date) {
    return new Date(fileMetadata.dataDate);
  }

  // Try to extract date from filename (e.g., "performance_2026-04-10.xlsx")
  if (fileMetadata.fileName) {
    const dateMatch = fileMetadata.fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const date = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Default: use current date (represents today's upload for today's data)
  // This is typical for daily uploads
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Validate Excel/CSV data structure
 * @param {object} row - Single row from the spreadsheet
 * @param {number} rowNumber - Row number (for error reporting)
 * @returns {object} - Validated and normalized row data
 */
function validateRow(row, rowNumber) {
  const errors = [];

  // Required field: Agent Name
  if (!row['Agent Name'] || typeof row['Agent Name'] !== 'string' || row['Agent Name'].trim() === '') {
    errors.push({
      field: 'Agent Name',
      value: row['Agent Name'],
      reason: 'Agent name is required and must be a non-empty string',
    });
  }

  // Optional but if provided, must be valid
  const timeFields = ['Total Talk Time (hh:mm:ss)', 'Total Logged In Time (hh:mm:ss)', 'Total Break Duration (hh:mm:ss)'];
  timeFields.forEach((field) => {
    if (row[field]) {
      // Basic validation (will be validated during conversion)
      if (typeof row[field] !== 'string' && typeof row[field] !== 'number') {
        errors.push({
          field,
          value: row[field],
          reason: `${field} must be a string in hh:mm:ss format or a number`,
        });
      }
    }
  });

  if (errors.length > 0) {
    throw { rowNumber, errors };
  }

  // Normalize agent name
  const normalizedRow = {
    ...row,
    'Agent Name': String(row['Agent Name']).trim(),
  };

  return normalizedRow;
}

/**
 * Detect file format from extension
 * @param {string} fileName - Original file name
 * @returns {string} - Format type (xlsx, xls, csv)
 */
function detectFileFormat(fileName) {
  const ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return ext;
  }
  return 'unknown';
}

module.exports = {
  calculateFileHash,
  detectDataDate,
  validateRow,
  detectFileFormat,
};
