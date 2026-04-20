import axios from 'axios';

/**
 * API Configuration Example
 * This shows how environment variables automatically switch between environments
 */

// ============================================
// ENVIRONMENT-BASED URL SELECTION
// ============================================

// Method 1: Using process.env (Recommended for React)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://optimetric-performance-tracker.onrender.com';

// Method 2: Environment detection
function getApiUrl() {
  // Priority 1: Environment variable (set in Vercel)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Priority 2: Production build detection
  if (process.env.NODE_ENV === 'production') {
    return 'https://optimetric-performance-tracker.onrender.com';
  }

  // Default: Production Render URL
  return 'https://optimetric-performance-tracker.onrender.com';
}

// ============================================
// AXIOS INSTANCE WITH DYNAMIC URL
// ============================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Important: Allow credentials (cookies, auth headers)
  withCredentials: true,
});

// ============================================
// REQUEST INTERCEPTOR - ADD AUTH TOKEN
// ============================================

api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Add to every request
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - HANDLE ERRORS
// ============================================

api.interceptors.response.use(
  (response) => {
    // Success
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle 401 Unauthorized (token expired)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // Redirect to login
        window.location.href = '/';
      }
    } else if (error.request) {
      // Request made but no response (network error)
      console.error('No response:', error.request);
    } else {
      // Error in request setup
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// ============================================
// ENVIRONMENT VARIABLES SETUP
// ============================================

/*
HOW TO SET UP ENVIRONMENT VARIABLES:

1. LOCAL DEVELOPMENT (.env.local)
   REACT_APP_API_URL=http://localhost:5000 (for local testing)

2. PRODUCTION (Vercel Dashboard)
   - Settings → Environment Variables
   - Name: REACT_APP_API_URL
   - Value: https://optimetric-performance-tracker.onrender.com
   - Environments: Production, Preview, Development

3. BUILD TIME
   - Vercel automatically injects env variables during build
   - Available as process.env.REACT_APP_API_URL
   - React build also embeds them in JavaScript

4. CONDITIONAL LOGIC
   if (process.env.REACT_APP_API_URL) {
     // Use env variable (Vercel)
   } else if (process.env.NODE_ENV === 'production') {
     // Use production URL (fallback)
   } else {
     // Use development URL (default)
   }
*/

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// In your React component:

import api from '../services/api';

function LoginForm() {
  const handleLogin = async (email, password) => {
    try {
      // This request will go to the URL determined above
      const response = await api.post('/api/v1/auth/login', {
        email,
        password,
      });
      
      // Save token
      localStorage.setItem('token', response.data.token);
      
      // Token will be automatically added to future requests via interceptor
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // Form JSX here
  );
}

// Every request will include:
// - baseURL: (from env variable or fallback)
// - Authorization header: Bearer <token>
// - Content-Type: application/json
// - credentials: true (sends cookies)
*/

// ============================================
// VERIFYING SETUP
// ============================================

console.log('🌐 API Configuration:');
console.log('   Base URL:', API_BASE_URL);
console.log('   Environment:', process.env.NODE_ENV);
console.log('   REACT_APP_API_URL:', process.env.REACT_APP_API_URL || 'NOT SET');

/*
Expected output:
- Development: Base URL: http://localhost:5000
- Production: Base URL: https://optimetric-performance-tracker.onrender.com
*/
