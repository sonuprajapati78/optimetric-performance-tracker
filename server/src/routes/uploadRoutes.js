/**
 * Upload Routes
 * Responsibility: ONLY route definitions and middleware composition
 * - Setup routes with correct HTTP methods
 * - Compose middlewares in correct order
 * - Delegate to controller
 * Routes follow: auth → file upload (multer) → validation → controller
 */

const express = require('express');
const router = express.Router();

const { upload, multerErrorHandler } = require('../middlewares/multerConfig');
const {
  validateFileBeforeUpload,
  validateUploadMetadata,
  validateDeleteRequest,
} = require('../middlewares/fileValidation');
const { authMiddleware } = require('../middleware/authMiddleware');

const uploadController = require('../controllers/uploadController');

const logger = require('../utils/logger');

/**
 * POST /api/uploads/performance
 * Upload Excel file with performance data
 *
 * Middleware chain order is CRITICAL:
 * 1. authMiddleware - Verify user is authenticated
 * 2. upload.single('file') - Multer handles file upload to memory
 * 3. multerErrorHandler - Handle multer-specific errors
 * 4. validateFileBeforeUpload - Validate file exists and has correct extension
 * 5. validateUploadMetadata - Validate request body (dataDate, flags)
 * 6. uploadPerformanceData - Controller processes the data
 */
router.post(
  '/performance',
  authMiddleware,
  upload.single('file'),
  multerErrorHandler,
  validateFileBeforeUpload,
  validateUploadMetadata,
  async (req, res, next) => {
    try {
      // Ensure file exists before calling controller
      if (!req.file) {
        logger.warn('File not found in request during upload');
        return res.status(400).json({
          success: false,
          error: 'No file provided in request',
          code: 'NO_FILE',
        });
      }

      // Call controller
      const result = await uploadController.uploadPerformanceData(req, res);
      
      // If controller returned without sending response (shouldn't happen, but safety check)
      if (result && !res.headersSent) {
        res.status(200).json(result);
      }
    } catch (error) {
      // Log detailed error information
      logger.error('Route handler unhandled error', {
        error: error.message,
        stack: error.stack,
        code: error.code,
      });

      // Only send response if not already sent
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: error.message || 'Upload processing failed',
          code: 'ROUTE_ERROR',
          details: {
            errorType: error.name,
          },
        });
      }

      // Pass to error handler middleware
      next(error);
    }
  }
);

/**
 * DELETE /api/uploads/clear
 * Clear performance data
 *
 * Query params:
 * - confirm=true (REQUIRED for safety)
 * - dataDate=YYYY-MM-DD (optional, clear only specific date)
 *
 * Middleware chain:
 * 1. authMiddleware - Verify user is authenticated
 * 2. validateDeleteRequest - Validate confirm parameter and date format
 * 3. clearPerformanceData - Controller deletes data
 */
router.delete(
  '/clear',
  authMiddleware,
  validateDeleteRequest,
  async (req, res) => {
    try {
      await uploadController.clearPerformanceData(req, res);
    } catch (error) {
      logger.error('Route handler error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Route processing failed',
        code: 'ROUTE_ERROR',
      });
    }
  }
);

/**
 * GET /api/uploads/history
 * Get upload history
 *
 * Query params:
 * - page=1 (pagination, default 1)
 * - limit=20 (records per page, max 100)
 * - status=SUCCESS|FAILED (optional filter)
 *
 * Middleware chain:
 * 1. authMiddleware - Verify user is authenticated
 * 2. getUploadHistory - Controller retrieves history
 */
router.get(
  '/history',
  authMiddleware,
  async (req, res) => {
    try {
      await uploadController.getUploadHistory(req, res);
    } catch (error) {
      logger.error('Route handler error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Route processing failed',
        code: 'ROUTE_ERROR',
      });
    }
  }
);

/**
 * Documentation of expected request formats:
 *
 * POST /api/uploads/performance
 * Headers: Authorization: Bearer <token>
 * Body (form-data):
 *   - file: Excel or CSV file (required)
 *   - dataDate: YYYY-MM-DD (optional)
 *   - overwriteDate: true|false (optional, default false)
 *   - allowDuplicates: true|false (optional, default false)
 *
 * Example cURL:
 *   curl -X POST http://localhost:5000/api/uploads/performance \
 *     -H "Authorization: Bearer token" \
 *     -F "file=@data.xlsx" \
 *     -F "dataDate=2026-04-20"
 *
 * DELETE /api/uploads/clear?confirm=true&dataDate=2026-04-20
 * Headers: Authorization: Bearer <token>
 *
 * GET /api/uploads/history?page=1&limit=20&status=SUCCESS
 * Headers: Authorization: Bearer <token>
 */

module.exports = router;
