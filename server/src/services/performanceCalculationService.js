/**
 * Performance Calculation Service
 * Responsibility: ONLY calculate performance metrics
 * - Transform raw data with calculations
 * - Call utility functions (calculateScore, convertToSeconds)
 * - Build standardized output format
 * Does NOT validate data or access database
 */

const convertToSeconds = require('../utils/convertToSeconds');
const calculateScore = require('../utils/calculateScore');
const logger = require('../utils/logger');

/**
 * Transform raw Excel data into performance records
 * Adds calculated fields and standardizes format
 * @param {Array} data - Raw data from Excel
 * @returns {Array} Transformed data with performance metrics
 */
function transformToPerformanceRecords(data) {
  try {
    const records = data.map((row, index) => {
      const agentName = String(row['Agent Name']).trim();

      // Convert time strings to seconds
      const talkTimeSeconds = convertToSeconds(
        String(row['Total Talk Time (hh:mm:ss)']).trim()
      );
      const loggedInTimeSeconds = convertToSeconds(
        String(row['Total Logged In Time (hh:mm:ss)']).trim()
      );
      const breakTimeSeconds = convertToSeconds(
        String(row['Total Break Duration (hh:mm:ss)']).trim()
      );

      // Calculate performance score
      const performanceScore = calculateScore(
        talkTimeSeconds,
        loggedInTimeSeconds,
        breakTimeSeconds
      );

      const record = {
        name: agentName,
        talkTime: talkTimeSeconds,
        loggedInTime: loggedInTimeSeconds,
        breakTime: breakTimeSeconds,
        performanceScore: Math.round(performanceScore * 100) / 100, // Round to 2 decimals
        raw: {
          talkTime: String(row['Total Talk Time (hh:mm:ss)']).trim(),
          loggedInTime: String(row['Total Logged In Time (hh:mm:ss)']).trim(),
          breakTime: String(row['Total Break Duration (hh:mm:ss)']).trim(),
        },
      };

      return record;
    });

    logger.info('Performance records transformation completed', {
      totalRecords: records.length,
    });

    return records;
  } catch (error) {
    logger.error('Performance transformation failed', { error: error.message });
    throw error;
  }
}

/**
 * Calculate aggregate statistics from records
 * @param {Array} records - Performance records
 * @returns {object} Statistics summary
 */
function calculateStatistics(records) {
  if (!records || records.length === 0) {
    return {
      totalRecords: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
    };
  }

  const scores = records.map((r) => r.performanceScore);

  return {
    totalRecords: records.length,
    averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
  };
}

module.exports = {
  transformToPerformanceRecords,
  calculateStatistics,
};
