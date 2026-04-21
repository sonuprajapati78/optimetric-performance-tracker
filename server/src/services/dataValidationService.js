/**
 * Data Validation Service
 * Responsibility: ONLY validate data structure and format
 * - Check required columns
 * - Validate data types
 * - Validate field formats (like HH:MM:SS)
 * - Return detailed validation errors
 * Does NOT parse files or access database
 */

const convertToSeconds = require('../utils/convertToSeconds');
const logger = require('../utils/logger');

const REQUIRED_COLUMNS = [
  'Agent Name',
  'Total Talk Time (hh:mm:ss)',
  'Total Logged In Time (hh:mm:ss)',
  'Total Break Duration (hh:mm:ss)',
];

/**
 * Validate Excel data structure
 * @param {Array} data - Parsed Excel data (array of objects)
 * @returns {object} Validation result
 */
function validateDataStructure(data) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    rowsChecked: 0,
    rowsValid: 0,
    invalidRows: [],
  };

  if (!Array.isArray(data) || data.length === 0) {
    result.valid = false;
    result.errors.push({
      type: 'NO_DATA',
      message: 'No data rows found in Excel file',
    });
    return result;
  }

  // Check headers
  const headerValidation = validateHeaders(data[0]);
  if (!headerValidation.valid) {
    result.valid = false;
    result.errors.push({
      type: 'MISSING_COLUMNS',
      message: `Missing required columns: ${headerValidation.missingColumns.join(', ')}`,
      details: {
        requiredColumns: REQUIRED_COLUMNS,
        missingColumns: headerValidation.missingColumns,
        presentColumns: headerValidation.presentColumns,
      },
    });
    return result;
  }

  // Validate each row
  data.forEach((row, index) => {
    const rowNum = index + 1;
    result.rowsChecked++;

    const rowValidation = validateRow(row, rowNum);
    if (!rowValidation.valid) {
      result.valid = false;
      result.invalidRows.push({
        rowNumber: rowNum,
        errors: rowValidation.errors,
      });
    } else {
      result.rowsValid++;
    }
  });

  logger.info('Data structure validation completed', {
    rowsChecked: result.rowsChecked,
    rowsValid: result.rowsValid,
    valid: result.valid,
  });

  return result;
}

/**
 * Validate column headers
 * @param {object} firstRow - First data row
 * @returns {object} Header validation result
 */
function validateHeaders(firstRow) {
  const result = {
    valid: false,
    missingColumns: [],
    presentColumns: [],
  };

  if (!firstRow) {
    result.missingColumns = REQUIRED_COLUMNS;
    return result;
  }

  const presentColumns = Object.keys(firstRow);
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !presentColumns.includes(col)
  );

  result.presentColumns = presentColumns;
  result.missingColumns = missingColumns;
  result.valid = missingColumns.length === 0;

  return result;
}

/**
 * Validate single data row
 * @param {object} row - Data row to validate
 * @param {number} rowNumber - Row number for error reporting
 * @returns {object} Row validation result
 */
function validateRow(row, rowNumber) {
  const result = {
    valid: true,
    errors: [],
  };

  // Check Agent Name
  if (!row['Agent Name'] || String(row['Agent Name']).trim() === '') {
    result.valid = false;
    result.errors.push({
      field: 'Agent Name',
      message: 'Agent Name is required and cannot be empty',
    });
  }

  // Validate time fields
  const timeFields = [
    'Total Talk Time (hh:mm:ss)',
    'Total Logged In Time (hh:mm:ss)',
    'Total Break Duration (hh:mm:ss)',
  ];

  timeFields.forEach((field) => {
    if (!row[field]) {
      result.valid = false;
      result.errors.push({
        field,
        message: `${field} is required`,
      });
      return;
    }

    const timeValue = String(row[field]).trim();
    const timeRegex = /^(\d{1,2}):(\d{2}):(\d{2})$/;

    if (!timeRegex.test(timeValue)) {
      result.valid = false;
      result.errors.push({
        field,
        message: `Invalid time format. Expected HH:MM:SS, got: ${timeValue}`,
      });
      return;
    }

    // Try converting to seconds
    try {
      convertToSeconds(timeValue);
    } catch (error) {
      result.valid = false;
      result.errors.push({
        field,
        message: `Invalid time value: ${timeValue}`,
      });
    }
  });

  return result;
}

module.exports = {
  validateDataStructure,
  validateHeaders,
  validateRow,
  REQUIRED_COLUMNS,
};
