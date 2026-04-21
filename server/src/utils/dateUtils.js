/**
 * Date Utilities
 * Helper functions for date operations
 */

const logger = require('./logger');

/**
 * Parse date from string or request metadata
 * Formats accepted: YYYY-MM-DD
 * @param {string|Date} dateInput - Date input
 * @returns {Date} Normalized date
 */
function parseDate(dateInput) {
  try {
    if (dateInput instanceof Date) {
      return dateInput;
    }

    if (typeof dateInput === 'string') {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date string: ${dateInput}`);
      }
      return date;
    }

    return new Date();
  } catch (error) {
    logger.warn('Date parsing failed, using current date', {
      input: dateInput,
      error: error.message,
    });
    return new Date();
  }
}

/**
 * Get start of day (00:00:00)
 * @param {Date} date - Input date
 * @returns {Date} Start of day
 */
function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (23:59:59.999)
 * @param {Date} date - Input date
 * @returns {Date} End of day
 */
function getEndOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Extract date from filename
 * Expected format: YYYY-MM-DD anywhere in filename
 * @param {string} fileName - Filename
 * @returns {Date|null} Extracted date or null
 */
function extractDateFromFileName(fileName) {
  try {
    const dateRegex = /(\d{4})-(\d{2})-(\d{2})/;
    const match = fileName.match(dateRegex);

    if (match) {
      const date = new Date(`${match[1]}-${match[2]}-${match[3]}`);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return null;
  } catch (error) {
    logger.warn('Date extraction from filename failed', {
      fileName,
      error: error.message,
    });
    return null;
  }
}

/**
 * Format date as YYYY-MM-DD string
 * @param {Date} date - Input date
 * @returns {string} Formatted date string
 */
function formatDateToString(date) {
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    logger.error('Date formatting failed', { error: error.message });
    throw error;
  }
}

module.exports = {
  parseDate,
  getStartOfDay,
  getEndOfDay,
  extractDateFromFileName,
  formatDateToString,
};
