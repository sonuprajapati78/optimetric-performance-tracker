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
 * Parse Excel or CSV buffer into JSON array
 * @param {Buffer} fileBuffer - File buffer from multer
 * @returns {Array} Array of objects from first sheet or CSV
 * @throws {Error} If buffer is not valid Excel or CSV
 */
function parseExcelToJson(fileBuffer) {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Empty file buffer provided');
    }

    // Try to detect file type
    const isExcelFormat = isExcelFile(fileBuffer);
    const isCsvFormat = isCSVFile(fileBuffer);

    if (!isExcelFormat && !isCsvFormat) {
      throw new Error('File is neither valid Excel nor CSV format');
    }

    // Parse based on format
    if (isCsvFormat && !isExcelFormat) {
      // CSV format - parse as plain text
      const csvText = fileBuffer.toString('utf8');
      return parseCSV(csvText);
    } else {
      // Excel format (.xlsx, .xls)
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
        format: 'XLSX/XLS',
      });

      return jsonData;
    }
  } catch (error) {
    logger.error('File parsing failed', { error: error.message });
    throw error;
  }
}

/**
 * Check if buffer is Excel file format
 * @param {Buffer} fileBuffer - File buffer
 * @returns {boolean} True if Excel format
 */
function isExcelFile(fileBuffer) {
  try {
    if (!fileBuffer || fileBuffer.length < 4) {
      return false;
    }
    // Check for ZIP signature (0x50 0x4B = "PK")
    // .xlsx files are ZIP archives
    return fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b;
  } catch (error) {
    return false;
  }
}

/**
 * Check if buffer is CSV file format
 * @param {Buffer} fileBuffer - File buffer
 * @returns {boolean} True if likely CSV format
 */
function isCSVFile(fileBuffer) {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      return false;
    }
    // Try to decode as UTF-8
    const text = fileBuffer.toString('utf8', 0, Math.min(1000, fileBuffer.length));
    // CSV should contain commas, tabs, or semicolons as delimiters
    // and should not contain binary data
    return /[\n,;\t]/.test(text) && !text.includes('\x00');
  } catch (error) {
    return false;
  }
}

/**
 * Parse CSV text into JSON array
 * @param {string} csvText - CSV text content
 * @returns {Array} Array of objects
 */
function parseCSV(csvText) {
  try {
    // Split by lines
    const lines = csvText.trim().split(/[\r\n]+/);
    if (lines.length === 0) {
      return [];
    }

    // Detect delimiter (comma, semicolon, or tab)
    const firstLine = lines[0];
    const delimiter = detectDelimiter(firstLine);

    // Parse header
    const headers = parseCSVLine(firstLine, delimiter);
    if (headers.length === 0) {
      throw new Error('CSV file has no headers');
    }

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = parseCSVLine(line, delimiter);
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      data.push(row);
    }

    logger.info('CSV parsing successful', {
      rowCount: data.length,
      delimiter,
      headers: headers.length,
    });

    return data;
  } catch (error) {
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
}

/**
 * Detect CSV delimiter (comma, semicolon, or tab)
 * @param {string} line - First CSV line
 * @returns {string} Detected delimiter
 */
function detectDelimiter(line) {
  // Count occurrences of each potential delimiter
  const commaCount = (line.match(/,/g) || []).length;
  const semicolonCount = (line.match(/;/g) || []).length;
  const tabCount = (line.match(/\t/g) || []).length;

  if (semicolonCount > commaCount && semicolonCount > tabCount) return ';';
  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  return ','; // Default to comma
}

/**
 * Parse a single CSV line, handling quoted fields
 * @param {string} line - CSV line
 * @param {string} delimiter - Field delimiter
 * @returns {Array} Parsed fields
 */
function parseCSVLine(line, delimiter) {
  const fields = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      // Field delimiter
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  fields.push(current.trim());

  return fields;
}

/**
 * Check if buffer is valid Excel or CSV file
 * @param {Buffer} fileBuffer - File buffer
 * @returns {boolean} True if valid Excel or CSV
 */
function isValidExcelBuffer(fileBuffer) {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      return false;
    }

    // Check if it's Excel format (ZIP-based)
    if (isExcelFile(fileBuffer)) {
      try {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        return workbook && workbook.SheetNames && workbook.SheetNames.length > 0;
      } catch (error) {
        logger.warn('Excel buffer validation failed', { error: error.message });
        return false;
      }
    }

    // Check if it's CSV format
    if (isCSVFile(fileBuffer)) {
      try {
        const csvText = fileBuffer.toString('utf8');
        const lines = csvText.trim().split(/[\r\n]+/);
        // CSV should have at least header + 1 data row
        return lines.length >= 1;
      } catch (error) {
        logger.warn('CSV buffer validation failed', { error: error.message });
        return false;
      }
    }

    return false;
  } catch (error) {
    logger.warn('Buffer validation failed', { error: error.message });
    return false;
  }
}

module.exports = {
  parseExcelToJson,
  isValidExcelBuffer,
};
