const { MIN_DENOMINATOR } = require('../constants');

/**
 * Calculates performance score based on business logic
 * Formula: (talkTime / (loggedInTime - breakTime)) * 100
 * 
 * @param {number} talkTime - Total talk time in seconds
 * @param {number} loggedInTime - Total logged in time in seconds
 * @param {number} breakTime - Total break duration in seconds
 * @returns {number} Performance score (0-100+)
 */
function calculateScore(talkTime, loggedInTime, breakTime) {
  // Validate inputs
  if (typeof talkTime !== 'number' || typeof loggedInTime !== 'number' || typeof breakTime !== 'number') {
    return 0;
  }

  const denominator = loggedInTime - breakTime;
  if (denominator <= MIN_DENOMINATOR) return 0; // Prevent division by zero
  
  return Number(((talkTime / denominator) * 100).toFixed(2));
}

module.exports = calculateScore;
