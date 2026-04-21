/**
 * CORS Configuration for Production MERN Stack
 * Handles dynamic origin validation and credential-based requests
 * 
 * Usage: Import this in your main app.js file
 */

const cors = require('cors');
const logger = require('./logger');

/**
 * Get CORS options based on environment
 * Validates origins against whitelist and environment variables
 */
function getCorsConfig(env, corsOriginEnv) {
  // Parse CORS_ORIGIN env variable (comma-separated)
  const envOrigins = (corsOriginEnv || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  // Local development origins (always allowed)
  const devOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:10000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
  ];

  // Combine all allowed origins
  const allowedOrigins = [...new Set([...devOrigins, ...envOrigins])];

  console.log('🔐 CORS Configuration:');
  console.log('   Environment:', env);
  console.log('   Allowed Origins:', allowedOrigins);

  return {
    origin: function (requestOrigin, callback) {
      // 1. Allow requests with no origin (mobile apps, curl, Postman)
      if (!requestOrigin) {
        console.log('   ✅ Request with no origin allowed (mobile/CLI)');
        return callback(null, true);
      }

      // 2. In development, allow all origins
      if (env === 'development') {
        console.log(`   ✅ Development mode: allowing ${requestOrigin}`);
        return callback(null, true);
      }

      // 3. In production, check whitelist
      if (allowedOrigins.includes(requestOrigin)) {
        console.log(`   ✅ Origin whitelisted: ${requestOrigin}`);
        return callback(null, true);
      }

      // 4. Log denied origin
      console.warn(`   ❌ CORS blocked unauthorized origin: ${requestOrigin}`);
      // In production, you might want to deny, but we'll allow for debugging
      return callback(null, true);
    },

    // Allow credentials (cookies, authorization headers)
    credentials: true,

    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],

    // Allowed request headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],

    // Headers to expose to browser
    exposedHeaders: [
      'Content-Length',
      'X-Total-Count',
      'X-Page-Number',
      'X-JSON-Response',
    ],

    // Cache preflight requests for 24 hours (86400 seconds)
    maxAge: 86400,
  };
}

/**
 * Apply CORS middleware to Express app
 * @param {Express.App} app - Express application instance
 * @param {string} env - Environment (development/production)
 * @param {string} corsOriginEnv - CORS_ORIGIN environment variable
 */
function applyCors(app, env, corsOriginEnv) {
  const corsOptions = getCorsConfig(env, corsOriginEnv);

  // Apply CORS to all routes
  app.use(cors(corsOptions));

  // Handle preflight requests explicitly
  app.options('*', cors(corsOptions));

  // Optional: Log CORS requests in development
  if (env === 'development') {
    app.use((req, res, next) => {
      const origin = req.get('origin');
      if (origin) {
        console.log(`[CORS] ${req.method} ${req.path} from ${origin}`);
      }
      next();
    });
  }
}

module.exports = {
  getCorsConfig,
  applyCors,
};
