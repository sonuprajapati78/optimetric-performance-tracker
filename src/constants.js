// Constants for upload configuration
const ALLOWED_FILE_EXTENSIONS = ['.xlsx', '.csv'];
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Performance score calculation constants
const MIN_DENOMINATOR = 0.1; // Minimum denominator to prevent division by zero

// Default limits
const DEFAULT_TOP_PERFORMERS_LIMIT = 5;
const MAX_TOP_PERFORMERS_LIMIT = 1000; // Allow up to 1000 agents

module.exports = {
  ALLOWED_FILE_EXTENSIONS,
  DEFAULT_MAX_FILE_SIZE,
  MIN_DENOMINATOR,
  DEFAULT_TOP_PERFORMERS_LIMIT,
  MAX_TOP_PERFORMERS_LIMIT,
};
