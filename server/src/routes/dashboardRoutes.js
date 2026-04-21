const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

/**
 * GET /api/v1/dashboard/personal
 * Private - Employee's personal performance data
 * Query params: period (today/week/month/year) or startDate & endDate
 */
router.get('/personal', authMiddleware, dashboardController.getPersonalPerformance);

/**
 * GET /api/v1/dashboard/monthly-top
 * Public - Top 5 performers of the month for incentives
 * Query params: month, year
 */
router.get('/monthly-top', dashboardController.getMonthlyTop);

/**
 * GET /api/v1/dashboard/all-employees
 * Private (Admin) - All employees' performance
 * Query params: period (today/week/month) or startDate & endDate
 */
router.get('/all-employees', authMiddleware, adminMiddleware, dashboardController.getAllEmployeesPerformance);

/**
 * GET /api/v1/dashboard/comparison
 * Private (Admin) - Compare multiple employees
 * Query params: employees (comma-separated), period
 */
router.get('/comparison', authMiddleware, adminMiddleware, dashboardController.getPerformanceComparison);

module.exports = router;
