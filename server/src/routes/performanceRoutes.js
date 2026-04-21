const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Joi = require('joi');

const performanceController = require('../controllers/performanceController');
const config = require('../config');
const { validateQuery } = require('../middleware/validation');
const { ALLOWED_FILE_EXTENSIONS, MAX_TOP_PERFORMERS_LIMIT } = require('../constants');

// Multer disk storage config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    // Use timestamp and random string for unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .xlsx or .csv files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize,
    files: 1,
  },
});

// Validation schema for query parameters
const topPerformersSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(MAX_TOP_PERFORMERS_LIMIT).optional(),
  unique: Joi.string().optional(),
});

/**
 * POST /api/v1/performance/upload
 * Upload and process performance data from Excel/CSV file
 * Body: multipart/form-data with 'file' field
 */
router.post('/upload', upload.single('file'), performanceController.uploadPerformance);

/**
 * GET /api/v1/performance/top-performers
 * Query params:
 *   - limit (optional, default: 5, max: 100): Number of top performers to return
 */
router.get('/top-performers', validateQuery(topPerformersSchema), performanceController.getTopPerformers);

module.exports = router;
