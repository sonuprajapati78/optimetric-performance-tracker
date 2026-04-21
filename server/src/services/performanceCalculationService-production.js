/**
 * Performance Calculation Service - Production
 * 
 * Responsibility: ONLY calculations & data transformation
 * - No database access
 * - No file I/O
 * - Pure business logic only
 * 
 * Core Formula: (talkTime / (loggedInTime - breakTime)) * 100
 */

const convertToSeconds = require('../utils/convertToSeconds');
const calculateScore = require('../utils/calculateScore');
const logger = require('../utils/logger');

// ======================
// Main Transform Function
// ======================

/**
 * Transform raw Excel data into performance records
 * Adds calculated fields and standardizes format
 * 
 * @param {Array} data - Raw data from Excel
 * @returns {Array} Transformed data with performance metrics
 */
function transformToPerformanceRecords(data) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid or empty data array');
    }

    const records = data.map((row, index) => {
      try {
        // Extract and validate required fields
        const agentName = String(row['Agent Name'] || row['Name'] || '').trim();
        if (!agentName) {
          throw new Error(`Row ${index + 1}: Agent name is required`);
        }

        // Extract time strings and convert to seconds
        const talkTimeStr = String(row['Total Talk Time (hh:mm:ss)'] || row['Talk Time'] || '0').trim();
        const loggedInTimeStr = String(row['Total Logged In Time (hh:mm:ss)'] || row['Logged In Time'] || '0').trim();
        const breakTimeStr = String(row['Total Break Duration (hh:mm:ss)'] || row['Break Time'] || '0').trim();

        const talkTimeSeconds = convertToSeconds(talkTimeStr);
        const loggedInTimeSeconds = convertToSeconds(loggedInTimeStr);
        const breakTimeSeconds = convertToSeconds(breakTimeStr);

        // Calculate performance score
        const performanceScore = calculateScore(
          talkTimeSeconds,
          loggedInTimeSeconds,
          breakTimeSeconds
        );

        // Return standardized record
        return {
          name: agentName,
          talkTime: talkTimeSeconds,
          loggedInTime: loggedInTimeSeconds,
          breakTime: breakTimeSeconds,
          performanceScore: Math.round(performanceScore * 100) / 100, // Round to 2 decimals
          raw: {
            talkTime: talkTimeStr,
            loggedInTime: loggedInTimeStr,
            breakTime: breakTimeStr,
          },
        };
      } catch (error) {
        logger.warn(`Skipping row ${index + 1}: ${error.message}`);
        return null;
      }
    });

    // Filter out null records (skipped rows)
    const validRecords = records.filter(record => record !== null);

    logger.info('✓ Data transformation completed', {
      totalRows: data.length,
      validRecords: validRecords.length,
      skippedRows: records.length - validRecords.length,
    });

    return validRecords;

  } catch (error) {
    logger.error('✗ Error in data transformation', { error: error.message });
    throw error;
  }
}

// ======================
// Validation Functions
// ======================

/**
 * Validate if raw data has required columns
 */
function validateDataStructure(data) {
  const requiredFields = [
    'Agent Name',
    'Total Talk Time (hh:mm:ss)',
    'Total Logged In Time (hh:mm:ss)',
    'Total Break Duration (hh:mm:ss)',
  ];

  const alternativeFields = ['Name', 'Talk Time', 'Logged In Time', 'Break Time'];
  const firstRow = data[0] || {};

  const hasRequiredFields = requiredFields.some(field => field in firstRow);
  const hasAlternativeFields = alternativeFields.some(field => field in firstRow);

  return hasRequiredFields || hasAlternativeFields;
}

/**
 * Calculate aggregate statistics
 */
function calculateAggregateStats(records) {
  if (!records || records.length === 0) {
    return {
      totalRecords: 0,
      averagePerformance: 0,
      topPerformer: null,
      minPerformance: 0,
      maxPerformance: 0,
    };
  }

  const scores = records.map(r => r.performanceScore);
  const totalTalkTime = records.reduce((sum, r) => sum + r.talkTime, 0);
  const totalLoggedInTime = records.reduce((sum, r) => sum + r.loggedInTime, 0);

  return {
    totalRecords: records.length,
    averagePerformance: Math.round((scores.reduce((a, b) => a + b, 0) / records.length) * 100) / 100,
    topPerformer: records[0]?.name || null,
    minPerformance: Math.min(...scores),
    maxPerformance: Math.max(...scores),
    totalTalkTime,
    totalLoggedInTime,
  };
}

// ======================
// Export Functions
// ======================

module.exports = {
  transformToPerformanceRecords,
  validateDataStructure,
  calculateAggregateStats,
};
