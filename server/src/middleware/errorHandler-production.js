/**
 * Error Handler Middleware - Production
 * 
 * Features:
 * - Standard response format for all errors
 * - Detailed logging
 * - Distinguishes between client and server errors
 * - Graceful error responses
 */

const logger = require('../utils/logger');

// ======================
// Custom Error Class
// ======================
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

// ======================
// Async Handler Wrapper
// ======================
/**
 * Wraps async route handlers to catch errors
 * Usage: asyncHandler(async (req, res) => { ... })
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ======================
// Global Error Handler Middleware
// ======================
/**
 * IMPORTANT: Must be placed AFTER all other middleware and routes
 * 
 * Handles all types of errors:
 * - API Errors (custom)
 * - Multer errors (file upload)
 * - Database errors
 * - Validation errors
 * - Unexpected errors
 */
const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = null;

  // ======================
  // Error Type Handling
  // ======================

  // Multer file upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'FILE_TOO_LARGE') {
      message = 'File size exceeds 10MB limit';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Only one file allowed per request';
    } else {
      message = err.message;
    }
    details = { code: err.code };
  }

  // Multer custom errors (from fileFilter)
  else if (err.name === 'Error' && err.message?.includes('Invalid file type')) {
    statusCode = 400;
    message = err.message;
  }

  // Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Data validation failed';
    details = Object.entries(err.errors).reduce((acc, [key, error]) => {
      acc[key] = error.message;
      return acc;
    }, {});
  }

  // Mongoose duplicate key error
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry detected';
    const field = Object.keys(err.keyPattern)[0];
    details = { field, value: err.keyValue[field] };
  }

  // Mongoose cast error
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    details = { field: err.path, value: err.value };
  }

  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // ======================
  // Logging
  // ======================
  
  if (statusCode >= 500) {
    // Server errors: log full stack
    logger.error('Server Error', {
      message,
      statusCode,
      url: req.originalUrl,
      method: req.method,
      error: err.stack,
    });
  } else if (statusCode >= 400) {
    // Client errors: log without full stack
    logger.warn('Client Error', {
      message,
      statusCode,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // ======================
  // Response Format (Standard)
  // ======================
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  });
};

// ======================
// 404 Not Found Handler
// ======================
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  ApiError,
  asyncHandler,
  globalErrorHandler,
  notFoundHandler,
  errorHandler: globalErrorHandler, // Alias for backward compatibility
};
