const Agent = require('../models/Agent');
const Employee = require('../models/Employee');
const logger = require('../utils/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get employee's personal performance data
 * GET /api/v1/dashboard/personal
 */
exports.getPersonalPerformance = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;
  const { startDate, endDate, period } = req.query;

  // Find employee name from user ID (if Employee model exists)
  let employeeName = req.user.name;
  try {
    const employee = await Employee.findById(employeeId);
    if (employee) {
      employeeName = employee.name;
    }
  } catch (error) {
    // If employee not found, use name from decoded token
  }

  // Build date filter
  let dateFilter = {};
  if (period) {
    const now = new Date();
    switch (period) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter = { $gte: today };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { $gte: weekAgo };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { $gte: monthAgo };
        break;
      case 'year':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        dateFilter = { $gte: yearAgo };
        break;
    }
  } else if (startDate || endDate) {
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
  }

  // Query personal performance data
  const query = { name: employeeName };
  if (Object.keys(dateFilter).length > 0) {
    query.date = dateFilter;
  }

  const performance = await Agent.find(query)
    .sort({ date: -1 })
    .lean()
    .exec();

  // Calculate statistics
  const stats = {
    totalEntries: performance.length,
    averageScore: 0,
    bestScore: 0,
    worseScore: 0,
    totalTalkTime: 0,
    totalLoggedInTime: 0,
  };

  if (performance.length > 0) {
    const scores = performance.map(p => p.performanceScore);
    stats.averageScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    stats.bestScore = Math.max(...scores);
    stats.worseScore = Math.min(...scores);
    stats.totalTalkTime = performance.reduce((sum, p) => sum + (p.talkTime || 0), 0);
    stats.totalLoggedInTime = performance.reduce((sum, p) => sum + (p.loggedInTime || 0), 0);
  }

  logger.info(`Personal dashboard accessed: ${employeeName}`);

  res.json({
    employee: employeeName,
    period: period || 'custom',
    startDate: Object.keys(dateFilter).includes('$gte') ? dateFilter.$gte : startDate,
    endDate: Object.keys(dateFilter).includes('$lte') ? dateFilter.$lte : endDate,
    stats,
    data: performance,
    count: performance.length,
  });
});

/**
 * Get monthly top performers for incentives
 * GET /api/v1/dashboard/monthly-top
 */
exports.getMonthlyTop = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  
  // Default to current month
  const now = new Date();
  const currentMonth = month ? parseInt(month) : now.getMonth() + 1;
  const currentYear = year ? parseInt(year) : now.getFullYear();

  // Date range for the month
  const startDate = new Date(currentYear, currentMonth - 1, 1);
  const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  // Get unique agents with best scores for the month
  const topPerformers = await Agent.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$name',
        name: { $first: '$name' },
        performanceScore: { $max: '$performanceScore' },
        avgScore: { $avg: '$performanceScore' },
        talkTime: { $max: '$talkTime' },
        entries: { $sum: 1 },
      },
    },
    {
      $sort: { performanceScore: -1 },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        _id: 0,
        rank: 1,
        name: 1,
        performanceScore: { $round: ['$performanceScore', 2] },
        avgScore: { $round: ['$avgScore', 2] },
        entries: 1,
        incentive: {
          $cond: [
            { $eq: [{ $arrayElemAt: ['[1,2,3,4,5]', 0] }, 1] },
            '₹5000',
            {
              $cond: [
                { $eq: [{ $arrayElemAt: ['[1,2,3,4,5]', 1] }, 2] },
                '₹3000',
                {
                  $cond: [
                    { $eq: [{ $arrayElemAt: ['[1,2,3,4,5]', 2] }, 3] },
                    '₹2000',
                    '₹500',
                  ],
                },
              ],
            },
          ],
        },
      },
    },
  ]);

  // Add rank and incentive amounts
  topPerformers.forEach((performer, index) => {
    performer.rank = index + 1;
    const incentives = ['₹5000', '₹3000', '₹2000', '₹1000', '₹500'];
    performer.incentive = incentives[index] || '₹500';
  });

  logger.info(`Monthly top performers retrieved: ${currentMonth}/${currentYear}`);

  res.json({
    month: currentMonth,
    year: currentYear,
    dateRange: {
      start: startDate,
      end: endDate,
    },
    topPerformers,
    count: topPerformers.length,
  });
});

/**
 * Get all employees performance data (admin only)
 * GET /api/v1/dashboard/all-employees
 */
exports.getAllEmployeesPerformance = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;

  // Build date filter
  let dateFilter = {};
  if (period) {
    const now = new Date();
    switch (period) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter = { $gte: today };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { $gte: weekAgo };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { $gte: monthAgo };
        break;
    }
  } else if (startDate || endDate) {
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
  }

  const query = {};
  if (Object.keys(dateFilter).length > 0) {
    query.date = dateFilter;
  }

  // Get unique employees with their latest scores
  const allEmployees = await Agent.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$name',
        name: { $first: '$name' },
        performanceScore: { $max: '$performanceScore' },
        avgScore: { $avg: '$performanceScore' },
        entries: { $sum: 1 },
        talkTime: { $max: '$talkTime' },
        lastEntry: { $max: '$date' },
      },
    },
    { $sort: { performanceScore: -1 } },
    {
      $project: {
        _id: 0,
        name: 1,
        performanceScore: 1,
        avgScore: { $round: ['$avgScore', 2] },
        entries: 1,
        talkTime: 1,
        lastEntry: 1,
      },
    },
  ]);

  res.json({
    period: period || 'custom',
    employees: allEmployees,
    totalEmployees: allEmployees.length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get employee performance comparison (admin only)
 * GET /api/v1/dashboard/comparison
 */
exports.getPerformanceComparison = asyncHandler(async (req, res) => {
  const { employees, period } = req.query;
  const employeeList = Array.isArray(employees) ? employees : employees?.split(',') || [];

  // Build date filter
  let dateFilter = {};
  const now = new Date();
  if (period === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = { $gte: weekAgo };
  } else if (period === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFilter = { $gte: monthAgo };
  } else {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    dateFilter = { $gte: today };
  }

  const query = { date: dateFilter };
  if (employeeList.length > 0) {
    query.name = { $in: employeeList };
  }

  const comparison = await Agent.find(query)
    .sort({ date: -1, name: 1 })
    .lean();

  res.json({
    period,
    comparison,
    count: comparison.length,
  });
});
