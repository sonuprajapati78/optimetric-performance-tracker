const express = require('express');

// Health check endpoint
const healthCheckRouter = express.Router();

healthCheckRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

healthCheckRouter.get('/ready', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'NOT_READY',
        message: 'Database not connected',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'ERROR',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = healthCheckRouter;
