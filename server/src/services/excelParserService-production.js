/**
 * Excel Parser Service - Production
 * 
 * Responsibility: Parse Excel/CSV files from memory buffer
 * - Validates Excel format
 * - Converts to JSON
 * - Handles errors gracefully
 */

const xlsx = require('xlsx');
const logger = require('../utils/logger');

/**
 * Check if buffer is valid Excel format
 * @param {Buffer} buffer - File buffer
 * @returns {boolean} True if valid Excel/CSV
 */
function isValidExcelBuffer(buffer) {
  try {
    if (!buffer || buffer.length === 0) {
      logger.warn('Invalid buffer: empty or undefined');
      return false;
    }

    // Try to read as workbook
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    return workbook && workbook.SheetNames && workbook.SheetNames.length > 0;
  } catch (error) {
    logger.warn('Invalid Excel format', { error: error.message });
    return false;
  }
}

/**
 * Parse Excel buffer to JSON array
 * @param {Buffer} buffer - Excel file buffer
 * @returns {Array} Array of objects from first sheet
 */
function parseExcelToJson(buffer) {
  try {
    if (!isValidExcelBuffer(buffer)) {
      throw new Error('Invalid Excel file format');
    }

    // Read workbook from buffer
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in Excel file');
    }

    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    logger.info(`✓ Processing sheet: ${firstSheetName}`);

    // Convert sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet, {
      defval: '', // Default value for empty cells
      blankrows: false, // Skip blank rows
    });

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error('No data found in Excel sheet');
    }

    logger.info('✓ Excel parsed successfully', {
      sheet: firstSheetName,
      rows: jsonData.length,
      columns: Object.keys(jsonData[0] || {}),
    });

    return jsonData;

  } catch (error) {
    logger.error('Excel parsing error', { error: error.message });
    throw error;
  }
}

/**
 * Parse CSV text to JSON array
 * @param {string} csvText - CSV file content
 * @returns {Array} Array of objects
 */
function parseCsvToJson(csvText) {
  try {
    // Create workbook from CSV text
    const workbook = xlsx.read(csvText, { type: 'string' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    logger.info('✓ CSV parsed successfully', {
      rows: jsonData.length,
    });

    return jsonData;

  } catch (error) {
    logger.error('CSV parsing error', { error: error.message });
    throw error;
  }
}

/**
 * Get metadata about Excel file
 */
function getExcelMetadata(buffer) {
  try {
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    return {
      sheetNames: workbook.SheetNames,
      totalSheets: workbook.SheetNames.length,
      fileType: 'Excel',
    };
  } catch (error) {
    logger.error('Error reading Excel metadata', { error: error.message });
    throw error;
  }
}

// ======================
// Export Functions
// ======================

module.exports = {
  isValidExcelBuffer,
  parseExcelToJson,
  parseCsvToJson,
  getExcelMetadata,
};
