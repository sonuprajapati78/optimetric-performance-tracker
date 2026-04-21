// Converts time string (hh:mm:ss or h:mm:ss) to seconds
// Handles edge cases and invalid input gracefully
function convertToSeconds(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  // Why: Ensures consistent conversion for all valid time formats
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

module.exports = convertToSeconds;
