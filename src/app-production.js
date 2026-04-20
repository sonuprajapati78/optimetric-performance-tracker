/**
 * Production-Ready Performance Tracker API
 * Main Application Entry Point
 * 
 * Core Features:
 * - Excel file upload and performance analysis
 * - Performance report generation
 * - Data reset capability
 * 
 * Architecture: Modular with Routes -> Controllers -> Services
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./utils/logger');

// Import Configuration & Middleware
const config = require('./config');
const { errorHandler, globalErrorHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// Import Routes
const performanceRoutes = require('./routes/performanceRoutes-production');

// Initialize Express App
const app = express();

// ======================
// Middleware Setup
// ======================

// Security & Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS Configuration
const corsOptions = {
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Request Logging
app.use(requestLogger);

// ======================
// Health Check Endpoint
// ======================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'running',
    message: 'Performance Tracker API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// ======================
// Root Endpoint
// ======================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Performance Tracker API - Production Ready',
    version: '2.0.0',
    environment: config.env,
    endpoints: {
      upload: {
        method: 'POST',
        path: '/api/v1/performance/upload',
        description: 'Upload Excel file and analyze performance data',
        body: 'multipart/form-data with file field',
      },
      report: {
        method: 'GET',
        path: '/api/v1/performance/report',
        description: 'Get performance report with agent rankings',
        query: 'limit (optional, default: 5)',
      },
      reset: {
        method: 'DELETE',
        path: '/api/v1/performance/reset',
        description: 'Clear all performance data (production-ready)',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// ======================
// API Routes
// ======================
app.use('/api/v1/performance', performanceRoutes);

// ======================
// 404 Handler
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// ======================
// Global Error Handler (MUST be last)
// ======================
app.use(globalErrorHandler);

// ======================
// Database Connection & Server Startup
// ======================

let server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    logger.info('✓ MongoDB connected successfully');

    // Start Express Server
    server = app.listen(config.port, () => {
      logger.info(`✓ Server started on port ${config.port}`);
      logger.info(`✓ Environment: ${config.env}`);
      logger.info(`✓ API Version: v1`);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// ======================
// Graceful Shutdown
// ======================

const gracefulShutdown = () => {
  logger.info('Graceful shutdown initiated...');
  
  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await mongoose.connection.close();
      logger.info('✓ MongoDB connection closed');
    } catch (error) {
      logger.error('Error closing MongoDB connection', { error: error.message });
    }
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ======================
// Handle Unhandled Errors
// ======================

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', {
    promise: promise.toString(),
    reason: reason,
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// ======================
// Start Server
// ======================

if (require.main === module) {
  startServer();
}

module.exports = app;
