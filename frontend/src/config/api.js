/**
 * API Configuration for Frontend (React/Vite)
 * Dynamically switches between local development and production URLs
 */

// Get API URL based on environment
function getApiUrl() {
  // 1. Check if REACT_APP_API_URL env variable is set (highest priority)
  if (process.env.REACT_APP_API_URL) {
    console.log('📡 Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  // 2. Check if we're in production build
  if (process.env.NODE_ENV === 'production') {
    const productionUrl = 'https://optimetric-performance-tracker.onrender.com';
    console.log('🚀 Production mode - Using Render URL:', productionUrl);
    return productionUrl;
  }

  // 3. Development mode - use localhost
  const devUrl = 'http://localhost:5000';
  console.log('🔨 Development mode - Using localhost:', devUrl);
  return devUrl;
}

// Export the API URL
export const API_BASE_URL = getApiUrl();

// Log configuration on startup
console.log('🔧 API Configuration:');
console.log('   Node Environment:', process.env.NODE_ENV);
console.log('   API Base URL:', API_BASE_URL);
console.log('   REACT_APP_API_URL env:', process.env.REACT_APP_API_URL || 'not set');
