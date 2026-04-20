/**
 * Excel Parser Service
 * Responsibility: ONLY parse Excel/CSV files from buffer
 * - Read workbook from buffer
 * - Extract sheet data
 * - Convert to JSON format
 * Does NOT validate or manipulate data
 * Does NOT access database
 */

const XLSX = require('xlsx');
const logger = require('../utils/logger');

/**
 * Parse Excel buffer into JSON array
 * @param {Buffer} fileBuffer - File buffer from multer
 * @returns {Array} Array of objects from first sheet
 * @throws {Error} If buffer is not valid Excel
 */
function parseExcelToJson(fileBuffer) {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Empty file buffer provided');
    }

    // Read workbook from buffer
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in Excel file');
    }

    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      throw new Error(`Cannot read sheet: ${firstSheetName}`);
    }

    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    logger.info('Excel parsing successful', {
      sheetName: firstSheetName,
      rowCount: jsonData.length,
    });

    return jsonData;
  } catch (error) {
    logger.error('Excel parsing failed', { error: error.message });
    throw error;
  }
}

/**
 * Check if buffer is valid Excel file
 * @param {Buffer} fileBuffer - File buffer
 * @returns {boolean} True if valid Excel
 */
function isValidExcelBuffer(fileBuffer) {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      return false;
    }

    // Check for Excel magic bytes (PK for zip-based formats)
    const hasExcelSignature = fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b;

    if (!hasExcelSignature) {
      return false;
    }

    // Try to read it
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    return workbook && workbook.SheetNames && workbook.SheetNames.length > 0;
  } catch (error) {
    logger.warn('Excel buffer validation failed', { error: error.message });
    return false;
  }
}

module.exports = {
  parseExcelToJson,
  isValidExcelBuffer,
};
