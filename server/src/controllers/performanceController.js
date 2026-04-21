const Agent = require('../models/Agent');
const convertToSeconds = require('../utils/convertToSeconds');
const calculateScore = require('../utils/calculateScore');
const logger = require('../utils/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { ALLOWED_FILE_EXTENSIONS, DEFAULT_TOP_PERFORMERS_LIMIT } = require('../constants');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * Upload and process performance data from Excel/CSV file
 * POST /api/v1/performance/upload
 */
exports.uploadPerformance = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  // Path normalization for cross-platform compatibility
  const uploadPath = path.join(path.dirname(req.file.path), path.basename(req.file.path));
  const ext = path.extname(req.file.originalname);
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    // Clean up uploaded file on validation failure
    fs.unlink(uploadPath, (err) => {
      if (err) logger.warn(`Failed to delete file: ${uploadPath}`);
    });
    throw new ApiError(400, `Invalid file type. Only ${ALLOWED_FILE_EXTENSIONS.join(', ')} allowed.`);
  }

  try {
    // Log the file path for debugging
    console.log('Uploaded file path:', uploadPath);
    const workbook = xlsx.readFile(uploadPath);
    if (!workbook.SheetNames.length) {
      throw new ApiError(400, 'File does not contain any sheets');
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ApiError(400, 'File contains no data rows');
    }

    // Column validation
    const requiredColumns = [
      'Agent Name',
      'Total Talk Time (hh:mm:ss)',
      'Total Logged In Time (hh:mm:ss)',
      'Total Break Duration (hh:mm:ss)'
    ];
    const fileColumns = Object.keys(rows[0] || {});
    const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));
    if (missingColumns.length > 0) {
      throw new ApiError(400, `Missing required columns: ${missingColumns.join(', ')}`);
    }

    const errors = [];
    let successCount = 0;

    // Normalize date to only yyyy-mm-dd (ignore time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      // Skip empty rows
      if (!row['Agent Name'] || typeof row['Agent Name'] !== 'string') {
        continue;
      }

      try {
        const name = String(row['Agent Name']).trim();
        const talkTime = convertToSeconds(row['Total Talk Time (hh:mm:ss)']);
        const loggedInTime = convertToSeconds(row['Total Logged In Time (hh:mm:ss)']);
        const breakTime = convertToSeconds(row['Total Break Duration (hh:mm:ss)']);
        const performanceScore = calculateScore(talkTime, loggedInTime, breakTime);

        // Upsert logic: findOneAndUpdate with { name, date }
        await Agent.findOneAndUpdate(
          { name, date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } },
          {
            name,
            date: today,
            talkTime,
            loggedInTime,
            breakTime,
            performanceScore,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
      } catch (err) {
        errors.push({ row: index + 2, error: err.message });
        console.error('Detailed Error (row):', err);
      }
    }

    if (successCount === 0) {
      throw new ApiError(400, 'No valid agent data found in file', { errors });
    }

    logger.info(`Performance data uploaded`, {
      count: successCount,
      fileName: req.file.originalname,
    });

    res.status(201).json({
      message: 'Performance data uploaded successfully',
      count: successCount,
      ...(errors.length > 0 && { skipped: errors.length, errors }),
    });
  } catch (err) {
    // Detailed error logging for Render
    console.error('Detailed Error (catch):', err);
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, 'Error processing file', { error: err.message });
  } finally {
    // Clean up uploaded file
    fs.unlink(uploadPath, (err) => {
      if (err) logger.warn(`Failed to delete file: ${uploadPath}`);
    });
  }
});

/**
 * Fetch top performers by performance score
 * GET /api/v1/performance/top-performers?limit=5&unique=true
 */
exports.getTopPerformers = asyncHandler(async (req, res) => {
  const limit = Math.min(
    parseInt(req.query.limit) || DEFAULT_TOP_PERFORMERS_LIMIT,
    100 // Max limit to prevent excessive queries
  );

  const unique = req.query.unique === 'true' || req.query.unique === '1';

  let topAgents;

  if (unique) {
    // Get unique agents with their best performance score
    topAgents = await Agent.aggregate([
      {
        $group: {
          _id: '$name',
          performanceScore: { $max: '$performanceScore' },
          talkTime: { $max: '$talkTime' },
          loggedInTime: { $first: '$loggedInTime' },
          breakTime: { $first: '$breakTime' },
          date: { $max: '$date' },
          name: { $first: '$name' },
        },
      },
      {
        $sort: { performanceScore: -1, date: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          performanceScore: 1,
          talkTime: 1,
          loggedInTime: 1,
          breakTime: 1,
          date: 1,
        },
      },
    ]);
  } else {
    // Get all records sorted by performance (original behavior)
    topAgents = await Agent
      .find()
      .sort({ performanceScore: -1, date: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  logger.debug(`Retrieved top performers`, { limit, count: topAgents.length, unique });

  res.json({
    data: topAgents,
    count: topAgents.length,
    limit,
    unique,
    timestamp: new Date().toISOString(),
  });
});
