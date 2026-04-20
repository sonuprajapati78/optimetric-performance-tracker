/**
 * Excel Service
 * Handles Excel file parsing, validation, and data extraction
 * Uses in-memory buffer processing for production efficiency
 */

const XLSX = require('xlsx');
const convertToSeconds = require('../utils/convertToSeconds');
const calculateScore = require('../utils/calculateScore');
const logger = require('../utils/logger');

// Required Excel columns for performance data
const REQUIRED_COLUMNS = [
  'Agent Name',
  'Total Talk Time (hh:mm:ss)',
  'Total Logged In Time (hh:mm:ss)',
  'Total Break Duration (hh:mm:ss)',
];

/**
 * Validate file buffer is a valid Excel file
 * @param {Buffer} buffer - File buffer
 * @returns {boolean} - True if valid Excel format
 */
function isValidExcelFile(buffer) {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('File buffer is empty');
    }
    
    // Check for Excel file signature (magic bytes)
    // XLSX files start with PK (0x50 0x4B) for zip format
    const hasExcelSignature = buffer[0] === 0x50 && buffer[1] === 0x4b;
    
    if (!hasExcelSignature && buffer.length < 8) {
      throw new Error('Invalid file format');
    }
    
    // Try to read the workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    return workbook && workbook.SheetNames && workbook.SheetNames.length > 0;
  } catch (error) {
    logger.error('Excel file validation failed', { error: error.message });
    return false;
  }
}

/**
 * Extract and validate column headers from Excel sheet
 * @param {Array} rows - First row(s) from Excel
 * @returns {object} - { valid: boolean, missingColumns: [], headers: {} }
 */
function validateHeaders(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      valid: false,
      missingColumns: REQUIRED_COLUMNS,
      headers: {},
    };
  }

  const firstRow = rows[0];
  const headers = Object.keys(firstRow || {});
  const missingColumns = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

  return {
    valid: missingColumns.length === 0,
    missingColumns,
    headers: headers,
  };
}

/**
 * Parse Excel buffer and extract performance data
 * @param {Buffer} fileBuffer - Excel file buffer from multer
 * @param {string} fileName - Original file name (for validation)
 * @returns {object} - { success: boolean, data: [], errors: [], warnings: [] }
 */
function parseExcelBuffer(fileBuffer, fileName) {
  const result = {
    success: false,
    data: [],
    errors: [],
    warnings: [],
  };

  try {
    // 1. Validate Excel file
    if (!isValidExcelFile(fileBuffer)) {
      result.errors.push({
        type: 'INVALID_FILE_FORMAT',
        message: 'File is not a valid Excel file (.xlsx, .xls, or .csv)',
        severity: 'critical',
      });
      return result;
    }

    // 2. Read workbook from buffer
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      result.errors.push({
        type: 'NO_SHEETS',
        message: 'Excel file contains no sheets',
        severity: 'critical',
      });
      return result;
    }

    // 3. Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 4. Convert sheet to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!Array.isArray(rows) || rows.length === 0) {
      result.errors.push({
        type: 'NO_DATA',
        message: `Sheet "${sheetName}" contains no data rows`,
        severity: 'critical',
      });
      return result;
    }

    // 5. Validate headers
    const headerValidation = validateHeaders(rows);
    if (!headerValidation.valid) {
      result.errors.push({
        type: 'MISSING_COLUMNS',
        message: `Missing required columns: ${headerValidation.missingColumns.join(', ')}`,
        severity: 'critical',
        missingColumns: headerValidation.missingColumns,
        availableColumns: headerValidation.headers,
      });
      return result;
    }

    // 6. Process each row
    const processedData = [];
    let skippedCount = 0;

    for (let rowIndex = 1; rowIndex < rows.length + 1; rowIndex++) {
      const row = rows[rowIndex - 1];

      // Skip empty rows
      if (!row || !row['Agent Name'] || String(row['Agent Name']).trim() === '') {
        skippedCount++;
        continue;
      }

      try {
        // Extract and validate data
        const agentName = String(row['Agent Name']).trim();

        if (!agentName) {
          result.warnings.push({
            row: rowIndex,
            message: 'Empty agent name, skipped',
            severity: 'warning',
          });
          skippedCount++;
          continue;
        }

        // Convert time strings to seconds
        const talkTime = convertToSeconds(String(row['Total Talk Time (hh:mm:ss)'] || '0:00:00'));
        const loggedInTime = convertToSeconds(String(row['Total Logged In Time (hh:mm:ss)'] || '0:00:00'));
        const breakTime = convertToSeconds(String(row['Total Break Duration (hh:mm:ss)'] || '0:00:00'));

        // Validate time conversions
        if (talkTime === -1 || loggedInTime === -1 || breakTime === -1) {
          result.errors.push({
            row: rowIndex,
            agentName,
            message: 'Invalid time format. Use HH:MM:SS',
            severity: 'error',
          });
          skippedCount++;
          continue;
        }

        // Calculate performance score
        const performanceScore = calculateScore(talkTime, loggedInTime, breakTime);

        // Add to processed data
        processedData.push({
          name: agentName,
          talkTime,
          loggedInTime,
          breakTime,
          performanceScore,
          rowIndex,
        });
      } catch (rowError) {
        result.errors.push({
          row: rowIndex,
          agentName: row['Agent Name'],
          message: rowError.message,
          severity: 'error',
        });
        skippedCount++;
      }
    }

    // 7. Final validation
    if (processedData.length === 0) {
      result.errors.push({
        type: 'NO_VALID_DATA',
        message: `No valid agent records found. Skipped ${skippedCount} rows.`,
        severity: 'critical',
      });
      return result;
    }

    // 8. Success
    result.success = true;
    result.data = processedData;

    if (skippedCount > 0) {
      result.warnings.push({
        message: `Successfully processed ${processedData.length} records, skipped ${skippedCount} invalid/empty rows`,
        severity: 'info',
      });
    }

    logger.info('Excel parsed successfully', {
      fileName,
      recordsProcessed: processedData.length,
      skippedRows: skippedCount,
      totalRows: rows.length,
    });

    return result;
  } catch (error) {
    logger.error('Excel parsing error', {
      error: error.message,
      fileName,
      stack: error.stack,
    });

    result.errors.push({
      type: 'PARSING_ERROR',
      message: `Failed to parse Excel file: ${error.message}`,
      severity: 'critical',
    });

    return result;
  }
}

/**
 * Validate Excel file metadata
 * @param {string} fileName - File name
 * @returns {object} - Validation result
 */
function validateFileMetadata(fileName) {
  const errors = [];
  const warnings = [];

  // Check file extension
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  if (!validExtensions.includes(ext)) {
    errors.push({
      type: 'INVALID_EXTENSION',
      message: `Invalid file extension: ${ext}. Allowed: ${validExtensions.join(', ')}`,
      severity: 'critical',
    });
  }

  // Warn if file name is very long
  if (fileName.length > 100) {
    warnings.push({
      type: 'LONG_FILENAME',
      message: 'File name is very long (>100 chars)',
      severity: 'warning',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  parseExcelBuffer,
  validateFileMetadata,
  isValidExcelFile,
  validateHeaders,
  REQUIRED_COLUMNS,
};
