require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  
  // MongoDB
  mongoUri: process.env.MONGO_URI,
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  
  // API
  apiVersion: process.env.API_VERSION || 'v1',
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000,
  
  // CORS - parse comma-separated origins into array
  corsOrigin: (process.env.CORS_ORIGIN || '*').split(',').map(origin => origin.trim()),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required environment variables
const requiredVars = ['MONGO_URI'];
const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = config;
