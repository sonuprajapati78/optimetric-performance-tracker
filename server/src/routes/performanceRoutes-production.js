/**
 * Production Performance Routes
 * 
 * Core Endpoints:
 * - POST /upload: Upload Excel and analyze performance
 * - GET /report: Get performance report
 * - DELETE /reset: Clear all data
 */

const express = require('express');
const router = express.Router();

// Import Multer Configuration (with memoryStorage)
const upload = require('../middlewares/multerConfig-production');

// Import Controllers
const performanceController = require('../controllers/performanceController-production');

// ======================
// API Routes
// ======================

/**
 * POST /api/v1/performance/upload
 * Upload Excel file and process performance data
 * 
 * Request: multipart/form-data with 'file' field
 * Response: { success: true, data: { processed, errors }, message: "" }
 */
router.post('/upload', upload.single('file'), performanceController.uploadPerformance);

/**
 * GET /api/v1/performance/report
 * Get performance report with agent rankings
 * 
 * Query Params:
 * - limit: Number of top performers (default: 5, max: 100)
 * 
 * Response: { success: true, data: { topPerformers, total }, message: "" }
 */
router.get('/report', performanceController.getPerformanceReport);

/**
 * DELETE /api/v1/performance/reset
 * Clear all performance data from database
 * 
 * Response: { success: true, data: { deletedCount }, message: "All data cleared" }
 */
router.delete('/reset', performanceController.resetPerformanceData);

module.exports = router;
