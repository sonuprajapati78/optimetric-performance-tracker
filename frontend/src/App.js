import React, { useState, useEffect } from 'react';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import ManagerDashboard from './components/ManagerDashboard';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing saved user:', err);
        logout();
      }
    }
  }, []);

  // Handle login success
  const handleLoginSuccess = (employee) => {
    setUser(employee);
  };

  // Handle logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // If not logged in, show login page
  if (!user) {
    return (
      <ErrorBoundary>
        <Login onLoginSuccess={handleLoginSuccess} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <Header user={user} onLogout={logout} />
        <ManagerDashboard />
      </div>
    </ErrorBoundary>
  );
}

export default App;
