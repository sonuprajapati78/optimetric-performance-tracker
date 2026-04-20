const logger = require('../utils/logger');

// Custom API Error class for consistent error handling
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Global error handler middleware - MUST be last middleware
const errorHandler = (err, req, res, next) => {
  // Ensure statusCode defaults to 500
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;

  // Log the error
  if (statusCode >= 500) {
    logger.error(message, {
      error: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn(message, {
      url: req.originalUrl,
      statusCode,
    });
  }

  // Send response
  res.status(statusCode).json({
    error: message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  });
};

// Async route handler wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler,
};
