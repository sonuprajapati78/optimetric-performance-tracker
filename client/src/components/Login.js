import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { API_BASE_URL } from '../config/api';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // ✅ PRODUCTION-SAFE: Show API configuration on mount for mobile debugging
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const info = `${isMobile ? '📱 Mobile' : '💻 Desktop'} | API: ${API_BASE_URL}`;
    setDebugInfo(info);
    console.log('🔧 Login Component:', info);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ✅ PRODUCTION-LEVEL: Validate input before sending
    if (!formData.email?.trim()) {
      setError('❌ Please enter your email');
      setLoading(false);
      return;
    }
    if (!formData.password?.trim()) {
      setError('❌ Please enter your password');
      setLoading(false);
      return;
    }
    if (!formData.email.includes('@')) {
      setError('❌ Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Login attempt:', {
        email: formData.email.trim().toLowerCase(),
        apiUrl: API_BASE_URL,
        userAgent: navigator.userAgent.substring(0, 50),
      });

      const response = await api.post('/api/v1/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.data.token && response.data.employee) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.employee));
        console.log('✅ Login successful:', response.data.employee.name);
        onLoginSuccess(response.data.employee);
      } else {
        setError('❌ Invalid server response. Please try again.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message;
      const status = err.response?.status;
      
      console.error('❌ Login failed:', {
        status,
        message: err.message,
        errorMsg,
        apiUrl: API_BASE_URL,
      });

      // ✅ PRODUCTION-SAFE: Detailed error messages for mobile
      if (status === 401) {
        setError('❌ Invalid email or password\n\n💡 Demo: admin@test.com / admin123');
      } else if (status === 400) {
        setError(`❌ ${errorMsg || 'Please check your email and password'}`);
      } else if (status === 409) {
        setError(`❌ ${errorMsg || 'Account already exists'}`);
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('❌ Request timeout. Check your internet connection and try again.');
      } else if (!err.response) {
        setError(`❌ Cannot connect to server at: ${API_BASE_URL}\n\nCheck your internet connection.`);
      } else {
        setError(`❌ ${errorMsg || 'Login failed. Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ✅ PRODUCTION-LEVEL: Validate all inputs
    if (!formData.name?.trim()) {
      setError('❌ Please enter your full name');
      setLoading(false);
      return;
    }
    if (!formData.email?.trim()) {
      setError('❌ Please enter your email');
      setLoading(false);
      return;
    }
    if (!formData.email.includes('@')) {
      setError('❌ Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (!formData.password?.trim()) {
      setError('❌ Please enter your password');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('❌ Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('📝 Registration attempt:', {
        email: formData.email.trim().toLowerCase(),
        apiUrl: API_BASE_URL,
      });

      const response = await api.post('/api/v1/auth/register', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        name: formData.name.trim(),
        department: formData.department || 'Sales',
      });

      if (response.data.token && response.data.employee) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.employee));
        console.log('✅ Registration successful:', response.data.employee.name);
        onLoginSuccess(response.data.employee);
      } else {
        setError('❌ Invalid server response. Please try again.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message;
      const status = err.response?.status;
      
      console.error('❌ Registration failed:', {
        status,
        message: err.message,
        errorMsg,
        apiUrl: API_BASE_URL,
      });

      // ✅ PRODUCTION-SAFE: Detailed error messages for mobile
      if (status === 409) {
        setError(`❌ ${errorMsg || 'Email or name already registered. Please login instead.'}`);
      } else if (status === 400) {
        setError(`❌ ${errorMsg || 'Please check your inputs'}`);
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('❌ Request timeout. Check your internet connection and try again.');
      } else if (!err.response) {
        setError(`❌ Cannot connect to server at: ${API_BASE_URL}`);
      } else {
        setError(`❌ ${errorMsg || 'Registration failed. Please try again.'}`);
      }
      
      console.error('❌ Registration error:', {
        status: err.response?.status,
        message: err.message,
        errorMsg: errorMsg,
      }); // ✅ Debug log
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <p>📊</p>
          <h1>Performance Tracker</h1>
          <p className="subtitle">Track Your Daily Performance</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab-button ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
              setFormData({ email: '', password: '', name: '', department: '' });
            }}
          >
            🔐 Login
          </button>
          <button
            className={`tab-button ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
              setFormData({ email: '', password: '', name: '', department: '' });
            }}
          >
            📝 Register
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="login-form" noValidate>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name-input">Full Name *</label>
                <input
                  id="name-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  aria-required="true"
                  aria-label="Full Name input field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="department-select">Department</label>
                <select
                  id="department-select"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  aria-label="Department selection dropdown"
                >
                  <option value="">Choose Department</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Customer Support</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email-input">Email *</label>
            <input
              id="email-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              aria-required="true"
              aria-label="Email address input field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password *</label>
            <input
              id="password-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              minLength="6"
              required
              aria-required="true"
              aria-label="Password input field, minimum 6 characters"
            />
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="login-footer">
          <p className="demo-note">
            Demo Credentials:<br />
            Email: admin@test.com | Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
