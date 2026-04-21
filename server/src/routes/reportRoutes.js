const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { optionalAuth } = require('../middleware/authMiddleware');

/**
 * GET /api/v1/reports/monthly
 * Get monthly performance report with top performers
 * Public endpoint - optional authentication
 * 
 * Query parameters:
 * - month: Month number (1-12), defaults to current month
 * - year: Year, defaults to current year
 * 
 * Response includes:
 * - All employees with monthly stats
 * - Top 5 performers with medals and incentive amounts
 * - Overall statistics (average, highest, lowest scores)
 */
router.get('/monthly', optionalAuth, reportController.getMonthlyReport);

/**
 * GET /api/v1/reports/daily
 * Get daily performance report
 * Public endpoint - optional authentication
 * 
 * Query parameters:
 * - date: Date in YYYY-MM-DD format, defaults to today
 * 
 * Response includes:
 * - Employees with daily stats
 * - Overall statistics for that day
 */
router.get('/daily', optionalAuth, reportController.getDailyReport);

/**
 * GET /api/v1/reports/range
 * Get performance report for a date range
 * Public endpoint - optional authentication
 * 
 * Query parameters (required):
 * - startDate: Start date in YYYY-MM-DD format
 * - endDate: End date in YYYY-MM-DD format
 * 
 * Response includes:
 * - Employees with aggregate stats over the range
 * - Number of days covered
 * - Overall statistics
 */
router.get('/range', optionalAuth, reportController.getRangeReport);

/**
 * GET /api/v1/reports/monthly/export
 * Export monthly report as CSV or JSON
 * Public endpoint - optional authentication
 * 
 * Query parameters:
 * - month: Month number (1-12), defaults to current month
 * - year: Year, defaults to current year
 * - format: 'csv' or 'json', defaults to json
 * 
 * Returns:
 * - CSV file if format=csv
 * - JSON data if format=json
 */
router.get('/monthly/export', optionalAuth, reportController.exportMonthlyReport);

module.exports = router;
