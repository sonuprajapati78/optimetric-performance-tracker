const convertToSeconds = require('../../src/utils/convertToSeconds');

describe('convertToSeconds', () => {
  test('should convert hh:mm:ss format correctly', () => {
    expect(convertToSeconds('01:30:45')).toBe(5445);
  });

  test('should handle single digit hours', () => {
    expect(convertToSeconds('1:05:30')).toBe(3930);
  });

  test('should return 0 for null/undefined', () => {
    expect(convertToSeconds(null)).toBe(0);
    expect(convertToSeconds(undefined)).toBe(0);
  });

  test('should return 0 for non-string input', () => {
    expect(convertToSeconds(123)).toBe(0);
    expect(convertToSeconds({})).toBe(0);
  });

  test('should return 0 for invalid format', () => {
    expect(convertToSeconds('invalid')).toBe(0);
    expect(convertToSeconds('1:30')).toBe(0); // Missing seconds
  });

  test('should handle zero values', () => {
    expect(convertToSeconds('00:00:00')).toBe(0);
  });
});
