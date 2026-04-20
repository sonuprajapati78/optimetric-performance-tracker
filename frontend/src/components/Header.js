import React from 'react';
import './Header.css';

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo">📊</div>
          <div>
            <h1>Performance Tracker</h1>
            <p>Agent Performance Analytics Dashboard</p>
          </div>
        </div>
        <div className="header-status">
          {user && (
            <>
              <div className="user-info">
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role === 'admin' ? '👨‍💼 Admin' : '👤 Employee'}</span>
                </div>
              </div>
              <button className="logout-btn" onClick={onLogout}>
                🚪 Logout
              </button>
            </>
          )}
          <span className="status-badge online">● Online</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
