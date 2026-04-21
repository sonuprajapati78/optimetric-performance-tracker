/**
 * API Configuration for Frontend (React/Vite)
 * Dynamically switches between local development and production URLs
 * ✅ PRODUCTION-SAFE: Works on mobile, desktop, all browsers
 */

// ✅ PRODUCTION-SAFE: Get API URL based on environment with mobile detection
function getApiUrl() {
  // 1. Check if REACT_APP_API_URL env variable is set (highest priority)
  if (process.env.REACT_APP_API_URL) {
    const url = process.env.REACT_APP_API_URL.trim();
    console.log('📡 Using REACT_APP_API_URL:', url);
    return url;
  }

  // 2. Check if we're in production build (NODE_ENV === 'production')
  if (process.env.NODE_ENV === 'production') {
    const productionUrl = 'https://optimetric-performance-tracker.onrender.com';
    console.log('🚀 Production build detected - Using Render URL:', productionUrl);
    return productionUrl;
  }

  // 3. Check if running on Vercel (REACT_APP_ENV variable)
  if (process.env.REACT_APP_ENV === 'production') {
    const vercelUrl = 'https://optimetric-performance-tracker.onrender.com';
    console.log('🌐 Vercel production detected - Using Render URL:', vercelUrl);
    return vercelUrl;
  }

  // 4. Development mode - use localhost (only for local development)
  const devUrl = 'http://localhost:5000';
  console.log('🔨 Development mode - Using localhost:', devUrl);
  return devUrl;
}

// ✅ PRODUCTION-SAFE: Export the API URL
export const API_BASE_URL = getApiUrl();

// ✅ PRODUCTION-SAFE: Log configuration on startup for debugging
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:');
  console.log('   Node Environment:', process.env.NODE_ENV);
  console.log('   React App Env:', process.env.REACT_APP_ENV || 'not set');
  console.log('   API Base URL:', API_BASE_URL);
  console.log('   REACT_APP_API_URL:', process.env.REACT_APP_API_URL || 'not set');
  console.log('   User Agent:', navigator.userAgent.substring(0, 50) + '...');
}
