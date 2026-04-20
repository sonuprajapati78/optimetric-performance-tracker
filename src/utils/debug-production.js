/**
 * Production Debugging Script
 * Run this to verify all connections and settings
 */

const mongoose = require('mongoose');
require('dotenv').config();

const config = {
  mongoUri: process.env.MONGO_URI,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  corsOrigin: process.env.CORS_ORIGIN,
};

console.log('\n========== PRODUCTION CONFIGURATION DEBUG ==========\n');

// Check environment variables
console.log('1️⃣  ENVIRONMENT VARIABLES:');
console.log('   NODE_ENV:', config.env);
console.log('   PORT:', config.port);
console.log('   MONGO_URI present:', !!config.mongoUri);
console.log('   CORS_ORIGIN:', config.corsOrigin);

// Check MongoDB connection
console.log('\n2️⃣  MONGODB CONNECTION TEST:');
async function testMongoDB() {
  try {
    console.log('   Attempting to connect to MongoDB...');
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('   ✅ MongoDB connected successfully!');
    
    // Check if demo user exists
    const Employee = require('../models/Employee');
    const adminUser = await Employee.findOne({ email: 'admin@test.com' });
    
    if (adminUser) {
      console.log('   ✅ Demo user (admin@test.com) exists in database');
    } else {
      console.log('   ⚠️  Demo user (admin@test.com) NOT found - you need to run seed script');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('   ❌ MongoDB connection failed:', error.message);
    console.log('   Check these:');
    console.log('      - MongoDB Atlas cluster is active');
    console.log('      - Connection string is correct');
    console.log('      - IP whitelist includes 0.0.0.0/0 or your Render IP');
    console.log('      - Password is URL encoded if it contains special characters');
  }
}

// Check API endpoints
console.log('\n3️⃣  API ENDPOINTS:');
console.log('   Login:    POST /api/v1/auth/login');
console.log('   Register: POST /api/v1/auth/register');
console.log('   Health:   GET  /api/health');

// Check CORS
console.log('\n4️⃣  CORS ALLOWED ORIGINS:');
const origins = (config.corsOrigin || '').split(',');
origins.forEach((origin, idx) => {
  console.log(`   ${idx + 1}. ${origin.trim()}`);
});

console.log('\n5️⃣  NEXT STEPS:');
console.log('   1. Verify MONGO_URI in Render environment variables');
console.log('   2. Ensure MongoDB Atlas IP whitelist is updated');
console.log('   3. Check Render logs: Dashboard → Service → Logs');
console.log('   4. Test API endpoint: curl https://optimetric-performance-tracker.onrender.com/api/v1/auth/login -X POST');
console.log('\n========== END DEBUG ==========\n');

testMongoDB();
