const calculateScore = require('../../src/utils/calculateScore');

describe('calculateScore', () => {
  test('should calculate score correctly', () => {
    const score = calculateScore(3600, 7200, 1800); // 1h talk, 2h logged in, 30m break
    const expected = (3600 / (7200 - 1800)) * 100;
    expect(score).toBe(Number(expected.toFixed(2)));
  });

  test('should return 0 when denominator is 0', () => {
    expect(calculateScore(3600, 3600, 0)).toBe(0); // loggedInTime == breakTime
  });

  test('should return 0 when denominator is negative', () => {
    expect(calculateScore(3600, 3600, 7200)).toBe(0); // breakTime > loggedInTime
  });

  test('should return 0 for non-numeric inputs', () => {
    expect(calculateScore('string', 7200, 1800)).toBe(0);
    expect(calculateScore(3600, null, 1800)).toBe(0);
  });

  test('should handle large numbers', () => {
    const score = calculateScore(100000, 200000, 50000);
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThan(0);
  });
});