const Agent = require('../models/Agent');
const UploadHistory = require('../models/UploadHistory');
const logger = require('../utils/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get date range for a specific month
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {object} - {startDate, endDate}
 */
function getMonthDateRange(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
}

/**
 * Get monthly performance report
 * GET /api/v1/reports/monthly?month=4&year=2026
 */
exports.getMonthlyReport = asyncHandler(async (req, res) => {
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year) || new Date().getFullYear();

  // Validate month
  if (month < 1 || month > 12) {
    throw new ApiError(400, 'Month must be between 1 and 12');
  }

  const { startDate, endDate } = getMonthDateRange(month, year);

  // Fetch all records for the month
  const records = await Agent.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ name: 1, date: 1 });

  if (records.length === 0) {
    return res.json({
      month,
      year,
      startDate,
      endDate,
      totalRecords: 0,
      employees: [],
      topPerformers: [],
      statistics: {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalEmployees: 0,
      },
    });
  }

  // Group by employee and calculate stats
  const employeeStats = {};

  records.forEach((record) => {
    if (!employeeStats[record.name]) {
      employeeStats[record.name] = {
        name: record.name,
        scores: [],
        talkTimes: [],
        loggedInTimes: [],
        recordCount: 0,
      };
    }

    employeeStats[record.name].scores.push(record.performanceScore);
    employeeStats[record.name].talkTimes.push(record.talkTime);
    employeeStats[record.name].loggedInTimes.push(record.loggedInTime);
    employeeStats[record.name].recordCount++;
  });

  // Calculate aggregate stats for each employee
  const employeeReports = Object.values(employeeStats).map((emp) => {
    const scores = emp.scores;
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    const maxScore = Math.max(...scores).toFixed(2);
    const minScore = Math.min(...scores).toFixed(2);

    const totalTalkTime = emp.talkTimes.reduce((a, b) => a + b, 0);
    const totalLoggedInTime = emp.loggedInTimes.reduce((a, b) => a + b, 0);
    const avgTalkTime = (totalTalkTime / emp.recordCount).toFixed(0);
    const avgLoggedInTime = (totalLoggedInTime / emp.recordCount).toFixed(0);

    return {
      employeeName: emp.name,
      recordCount: emp.recordCount,
      avgScore,
      maxScore,
      minScore,
      totalTalkTime,
      totalLoggedInTime,
      avgTalkTime,
      avgLoggedInTime,
      consistency: calculateConsistency(scores),
    };
  });

  // Sort by average score to identify top performers
  const topPerformers = [...employeeReports]
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5)
    .map((emp, index) => ({
      rank: index + 1,
      ...emp,
      medal: getMedalEmoji(index + 1),
      incentive: getIncentiveAmount(index + 1),
    }));

  // Calculate overall statistics
  const allScores = Object.values(employeeStats).flatMap((emp) => emp.scores);
  const overallStats = {
    totalRecords: records.length,
    totalEmployees: Object.keys(employeeStats).length,
    averageScore: (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2),
    highestScore: Math.max(...allScores).toFixed(2),
    lowestScore: Math.min(...allScores).toFixed(2),
    medianScore: calculateMedian(allScores).toFixed(2),
  };

  logger.info('Monthly report generated', { month, year, employees: overallStats.totalEmployees });

  res.json({
    month,
    year,
    startDate,
    endDate,
    employees: employeeReports.sort((a, b) => b.avgScore - a.avgScore),
    topPerformers,
    statistics: overallStats,
    generatedAt: new Date().toISOString(),
  });
});

/**
 * Get daily performance summary
 * GET /api/v1/reports/daily?date=2026-04-10
 */
exports.getDailyReport = asyncHandler(async (req, res) => {
  const dateStr = req.query.date || new Date().toISOString().split('T')[0];
  const reportDate = new Date(dateStr);

  if (isNaN(reportDate.getTime())) {
    throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');
  }

  reportDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(reportDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Fetch records for the day
  const records = await Agent.find({
    date: {
      $gte: reportDate,
      $lt: nextDay,
    },
  }).sort({ name: 1 });

  // Group by employee
  const employeeData = {};
  records.forEach((record) => {
    if (!employeeData[record.name]) {
      employeeData[record.name] = [];
    }
    employeeData[record.name].push(record);
  });

  // Calculate stats per employee
  const dailyStats = Object.entries(employeeData).map(([name, empRecords]) => {
    const avgScore =
      (empRecords.reduce((sum, r) => sum + r.performanceScore, 0) / empRecords.length).toFixed(2);
    const totalTalkTime = empRecords.reduce((sum, r) => sum + r.talkTime, 0);
    const totalLoggedInTime = empRecords.reduce((sum, r) => sum + r.loggedInTime, 0);

    return {
      employeeName: name,
      recordCount: empRecords.length,
      avgScore,
      totalTalkTime,
      totalLoggedInTime,
      records: empRecords.map((r) => ({
        score: r.performanceScore,
        talkTime: r.talkTime,
        loggedInTime: r.loggedInTime,
      })),
    };
  });

  if (records.length === 0) {
    return res.json({
      date: reportDate,
      totalRecords: 0,
      employees: [],
      statistics: {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      },
    });
  }

  const allScores = records.map((r) => r.performanceScore);
  const overallStats = {
    totalRecords: records.length,
    totalEmployees: Object.keys(employeeData).length,
    averageScore: (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2),
    highestScore: Math.max(...allScores).toFixed(2),
    lowestScore: Math.min(...allScores).toFixed(2),
  };

  logger.info('Daily report generated', { date: dateStr, records: records.length });

  res.json({
    date: reportDate,
    employees: dailyStats.sort((a, b) => b.avgScore - a.avgScore),
    statistics: overallStats,
    generatedAt: new Date().toISOString(),
  });
});

/**
 * Get date range report
 * GET /api/v1/reports/range?startDate=2026-04-01&endDate=2026-04-10
 */
exports.getRangeReport = asyncHandler(async (req, res) => {
  const startDateStr = req.query.startDate;
  const endDateStr = req.query.endDate;

  if (!startDateStr || !endDateStr) {
    throw new ApiError(400, 'startDate and endDate query parameters are required');
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');
  }

  if (startDate > endDate) {
    throw new ApiError(400, 'startDate cannot be after endDate');
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Fetch records for the range
  const records = await Agent.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1, name: 1 });

  if (records.length === 0) {
    return res.json({
      startDate,
      endDate,
      totalRecords: 0,
      employees: [],
      statistics: {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        daysCovered: 0,
      },
    });
  }

  // Group by employee
  const employeeStats = {};
  const daysSet = new Set();

  records.forEach((record) => {
    daysSet.add(record.date.toISOString().split('T')[0]);

    if (!employeeStats[record.name]) {
      employeeStats[record.name] = {
        name: record.name,
        scores: [],
        recordCount: 0,
      };
    }

    employeeStats[record.name].scores.push(record.performanceScore);
    employeeStats[record.name].recordCount++;
  });

  const employeeReports = Object.values(employeeStats).map((emp) => {
    const avgScore = (
      emp.scores.reduce((a, b) => a + b, 0) / emp.scores.length
    ).toFixed(2);

    return {
      employeeName: emp.name,
      recordCount: emp.recordCount,
      avgScore,
      maxScore: Math.max(...emp.scores).toFixed(2),
      minScore: Math.min(...emp.scores).toFixed(2),
    };
  });

  const allScores = records.map((r) => r.performanceScore);
  const overallStats = {
    totalRecords: records.length,
    totalEmployees: Object.keys(employeeStats).size,
    daysCovered: daysSet.size,
    averageScore: (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2),
    highestScore: Math.max(...allScores).toFixed(2),
    lowestScore: Math.min(...allScores).toFixed(2),
  };

  logger.info('Range report generated', {
    startDate: startDateStr,
    endDate: endDateStr,
    records: records.length,
  });

  res.json({
    startDate,
    endDate,
    employees: employeeReports.sort((a, b) => b.avgScore - a.avgScore),
    statistics: overallStats,
    generatedAt: new Date().toISOString(),
  });
});

/**
 * Export monthly report as CSV or JSON
 * GET /api/v1/reports/monthly/export?month=4&year=2026&format=csv
 */
exports.exportMonthlyReport = asyncHandler(async (req, res) => {
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const format = (req.query.format || 'json').toLowerCase();

  if (!['json', 'csv'].includes(format)) {
    throw new ApiError(400, 'format must be "json" or "csv"');
  }

  // Get the monthly report data
  const { startDate, endDate } = getMonthDateRange(month, year);

  const records = await Agent.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  if (records.length === 0) {
    throw new ApiError(404, 'No data found for the specified month');
  }

  // Group by employee
  const employeeStats = {};
  records.forEach((record) => {
    if (!employeeStats[record.name]) {
      employeeStats[record.name] = {
        name: record.name,
        scores: [],
      };
    }
    employeeStats[record.name].scores.push(record.performanceScore);
  });

  const employeeReports = Object.values(employeeStats)
    .map((emp) => ({
      employeeName: emp.name,
      avgScore: (emp.scores.reduce((a, b) => a + b, 0) / emp.scores.length).toFixed(2),
      maxScore: Math.max(...emp.scores).toFixed(2),
      recordCount: emp.scores.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  if (format === 'json') {
    return res.json({
      month,
      year,
      startDate,
      endDate,
      employees: employeeReports,
      records: records.length,
      exportedAt: new Date().toISOString(),
    });
  }

  // CSV format
  const headers = ['Rank', 'Employee Name', 'Avg Score', 'Max Score', 'Records'];
  const csvRows = [
    headers.join(','),
    ...employeeReports.map(
      (emp, idx) => `${idx + 1},"${emp.employeeName}",${emp.avgScore},${emp.maxScore},${emp.recordCount}`
    ),
  ];

  const csv = csvRows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="report_${month}_${year}.csv"`);
  res.send(csv);
});

// ===== Helper Functions =====

/**
 * Calculate score consistency (standard deviation)
 */
function calculateConsistency(scores) {
  if (scores.length === 0) return 0;

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Return consistency on scale 0-100 (lower std dev = higher consistency)
  return Math.max(0, (100 - stdDev * 5)).toFixed(2);
}

/**
 * Calculate median
 */
function calculateMedian(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Get medal emoji for rank
 */
function getMedalEmoji(rank) {
  const medals = ['🥇', '🥈', '🥉', '⭐', '⭐'];
  return medals[rank - 1] || '⭐';
}

/**
 * Get incentive amount for rank
 */
function getIncentiveAmount(rank) {
  const incentives = [5000, 3000, 2000, 1000, 500];
  return incentives[rank - 1] || 0;
}
