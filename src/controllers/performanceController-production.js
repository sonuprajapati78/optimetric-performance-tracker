/**
 * Performance Controller - Production
 * 
 * Responsibility: Orchestrate request/response only
 * - Extract data from request
 * - Call appropriate services
 * - Format and send response (standard format)
 * - Does NOT contain business logic
 * 
 * Standard Response Format:
 * { success: true/false, data: {...}, message: "...", timestamp: "..." }
 */

const logger = require('../utils/logger');
const { asyncHandler, ApiError } = require('../middleware/errorHandler-production');

// Import Services
const excelParserService = require('../services/excelParserService');
const performanceCalculationService = require('../services/performanceCalculationService');
const performanceService = require('../services/performanceService');

// Import Models
const Agent = require('../models/Agent');

// ======================
// Utility Functions
// ======================

/**
 * Standard success response formatter
 */
const successResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
};

// ======================
// Controller Functions
// ======================

/**
 * POST /api/v1/performance/upload
 * Upload Excel file and process performance data
 */
const uploadPerformance = asyncHandler(async (req, res) => {
  try {
    // Validate file exists
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded. Please upload an Excel or CSV file.');
    }

    logger.info('📁 File upload started', {
      fileName: req.file.originalname,
      size: req.file.size,
    });

    // Step 1: Parse Excel from memory buffer
    let rawData;
    try {
      rawData = excelParserService.parseExcelToJson(req.file.buffer);
      logger.info('✓ Excel parsed successfully', { rows: rawData.length });
    } catch (error) {
      logger.error('✗ Excel parsing failed', { error: error.message });
      throw new ApiError(400, `Failed to parse Excel: ${error.message}`);
    }

    if (!rawData || rawData.length === 0) {
      throw new ApiError(400, 'Excel file contains no data rows');
    }

    // Step 2: Calculate performance metrics
    let performanceRecords;
    try {
      performanceRecords = performanceCalculationService.transformToPerformanceRecords(rawData);
      logger.info('✓ Performance calculated', { records: performanceRecords.length });
    } catch (error) {
      logger.error('✗ Performance calculation failed', { error: error.message });
      throw new ApiError(500, `Performance calculation failed: ${error.message}`);
    }

    // Step 3: Save to database
    let savedCount = 0;
    const errors = [];

    for (const record of performanceRecords) {
      try {
        const agent = new Agent({
          name: record.name,
          date: new Date(),
          talkTime: record.talkTime,
          loggedInTime: record.loggedInTime,
          breakTime: record.breakTime,
          performanceScore: record.performanceScore,
        });
        
        await agent.save();
        savedCount++;
      } catch (dbError) {
        logger.warn('Failed to save agent record', {
          agentName: record.name,
          error: dbError.message,
        });
        errors.push({
          agentName: record.name,
          error: dbError.message,
        });
      }
    }

    logger.info('✓ Upload completed', {
      fileName: req.file.originalname,
      processed: savedCount,
      errors: errors.length,
    });

    // Response
    successResponse(res, 201, {
      processed: savedCount,
      total: performanceRecords.length,
      errors: errors.length > 0 ? errors : undefined,
    }, `${savedCount} agent records processed successfully`);

  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Unexpected error during upload', { error: error.message });
    throw new ApiError(500, 'Internal server error during upload');
  }
});

/**
 * GET /api/v1/performance/report
 * Get performance report with top agents
 */
const getPerformanceReport = asyncHandler(async (req, res) => {
  try {
    // Get limit from query (default: 5, max: 100)
    let limit = parseInt(req.query.limit, 10) || 5;
    limit = Math.min(limit, 100); // Cap at 100
    limit = Math.max(limit, 1);   // Minimum 1

    logger.info('📊 Generating report', { limit });

    // Fetch top performers from database
    const topPerformers = await Agent.find()
      .sort({ performanceScore: -1, date: -1 })
      .limit(limit)
      .lean()
      .exec();

    if (!topPerformers || topPerformers.length === 0) {
      logger.info('No performance data available');
      return successResponse(res, 200, {
        topPerformers: [],
        total: 0,
        message: 'No performance data available',
      }, 'Report generated (no data)');
    }

    // Get total agents in database
    const total = await Agent.countDocuments();

    logger.info('✓ Report generated', {
      topAgents: topPerformers.length,
      totalRecords: total,
    });

    // Format response
    const reportData = topPerformers.map((agent, index) => ({
      rank: index + 1,
      name: agent.name,
      performanceScore: agent.performanceScore,
      talkTime: agent.talkTime,
      loggedInTime: agent.loggedInTime,
      breakTime: agent.breakTime,
      date: agent.date,
    }));

    successResponse(res, 200, {
      topPerformers: reportData,
      total,
      limit,
    }, 'Performance report generated successfully');

  } catch (error) {
    logger.error('Error generating report', { error: error.message });
    throw new ApiError(500, 'Failed to generate performance report');
  }
});

/**
 * DELETE /api/v1/performance/reset
 * Clear all performance data from database
 */
const resetPerformanceData = asyncHandler(async (req, res) => {
  try {
    logger.warn('🗑️  Attempting to reset all performance data');

    // Ask for confirmation via query parameter
    const confirmed = req.query.confirm === 'true';
    if (!confirmed) {
      return res.status(400).json({
        success: false,
        message: 'Confirmation required. Add ?confirm=true to reset all data',
        timestamp: new Date().toISOString(),
      });
    }

    // Delete all agent records
    const result = await Agent.deleteMany({});

    logger.warn('✓ All performance data cleared', {
      deletedCount: result.deletedCount,
    });

    successResponse(res, 200, {
      deletedCount: result.deletedCount,
      message: 'All performance data has been cleared',
    }, 'Database reset successful');

  } catch (error) {
    logger.error('Error resetting database', { error: error.message });
    throw new ApiError(500, 'Failed to reset performance data');
  }
});

// ======================
// Export Controllers
// ======================

module.exports = {
  uploadPerformance,
  getPerformanceReport,
  resetPerformanceData,
};
