const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const performanceRoutes = require('./routes/performanceRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reportRoutes = require('./routes/reportRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Security & Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS - Production level configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const whitelist = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'https://optimetric-performance-tracker-zinx.vercel.app',
      'https://optimetric-performance-tracker.onrender.com',
    ];
    
    // In production, allow all origins but log them
    if (config.env === 'production') {
      logger.info(`CORS request from origin: ${origin}`);
      return callback(null, true);
    }
    
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Still allow in dev
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response'],
  maxAge: 86400,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Request logging
app.use(requestLogger);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve React frontend in production
if (config.env === 'production') {
  const publicPath = path.join(__dirname, '../public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    // Serve index.html for React routing
    app.get(/^\/(?!api\/).*/, (req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Performance Tracker API - Production Ready',
    version: config.apiVersion,
    status: 'running',
    endpoints: {
      auth: {
        register: '/api/v1/auth/register',
        login: '/api/v1/auth/login',
        verify: '/api/v1/auth/verify',
      },
      dashboard: {
        personal: '/api/v1/dashboard/personal',
        monthlyTop: '/api/v1/dashboard/monthly-top',
        allEmployees: '/api/v1/dashboard/all-employees',
        comparison: '/api/v1/dashboard/comparison',
      },
      uploads: {
        uploadPerformance: 'POST /api/v1/uploads/performance',
        getHistory: '/api/v1/uploads/history',
        getStats: '/api/v1/uploads/stats/summary',
        getDetail: '/api/v1/uploads/:uploadId',
      },
      reports: {
        monthlyReport: '/api/v1/reports/monthly',
        dailyReport: '/api/v1/reports/daily',
        rangeReport: '/api/v1/reports/range',
        exportMonthly: '/api/v1/reports/monthly/export',
      },
      performance: {
        topPerformers: '/api/v1/performance/top-performers',
        uploadLegacy: 'POST /api/v1/performance/upload',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check routes (before API routes for monitoring)
app.use(healthRoutes);

// API routes with versioning
app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/dashboard`, dashboardRoutes);
app.use(`/api/${config.apiVersion}/uploads`, uploadRoutes);
app.use(`/api/${config.apiVersion}/reports`, reportRoutes);
app.use(`/api/${config.apiVersion}/performance`, performanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (MUST be last)
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = () => {
  logger.info('Graceful shutdown initiated');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Connect to MongoDB and start server
let server;

const connectDB = async () => {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error('MongoDB connection error', { error: err.message });
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();
  server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`, {
      environment: config.env,
      version: config.apiVersion,
    });
  });
};

// Export for testing
module.exports = { app, startServer, server: null };

// Start server if this is the main module
if (require.main === module) {
  startServer().catch(err => {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  });
}
