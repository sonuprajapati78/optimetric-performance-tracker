import axios from 'axios';
import { API_BASE_URL } from '../config/api';

console.log('🌐 API Service initialized');
console.log('   Base URL:', API_BASE_URL);
console.log('   Environment:', process.env.NODE_ENV);

// ✅ PRODUCTION-SAFE: Create axios instance with proper mobile handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // ✅ PRODUCTION-SAFE: withCredentials for cookie-based auth (if needed)
  withCredentials: true,
});

// ✅ PRODUCTION-SAFE: Request interceptor with JWT token injection
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    
    // ✅ PRODUCTION-SAFE: Get token from localStorage (works on mobile)
    const token = localStorage.getItem('token');
    if (token) {
      // ✅ PRODUCTION-SAFE: Add Bearer token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token injected into request');
    } else {
      console.log('⚠️  No token found in localStorage');
      // Remove Authorization header if no token (important for mobile)
      delete config.headers.Authorization;
    }
    
    // ✅ PRODUCTION-SAFE: Ensure proper headers for mobile
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error.message);
    return Promise.reject(error);
  }
);

// ✅ PRODUCTION-SAFE: Response interceptor with detailed error handling
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // ✅ PRODUCTION-SAFE: Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      console.error('❌ Response error:', {
        status: error.response.status,
        message: error.response.data?.message || error.response.data?.error,
        url: error.config?.url,
      });
      
      // ✅ PRODUCTION-SAFE: Handle 401 (token invalid/expired)
      if (error.response.status === 401) {
        console.warn('🔐 Unauthorized (401) - Token may be invalid or expired');
        // Clear invalid token on mobile
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('❌ No response received:', {
        message: error.message,
        url: error.config?.url,
      });
    } else {
      // Error in request setup
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
