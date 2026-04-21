import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './PersonalDashboard.css';

function PersonalDashboard({ user }) {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState({
    stats: {},
    data: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPersonalData();
  }, [period]);

  const fetchPersonalData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/dashboard/personal', {
        params: { period },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="personal-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h2>👤 My Performance</h2>
          <p>Welcome, {user?.name}!</p>
        </div>
        <div className="period-selector">
          {['today', 'week', 'month', 'year'].map(p => (
            <button
              key={p}
              className={`period-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === 'today' && '📅 Today'}
              {p === 'week' && '📆 This Week'}
              {p === 'month' && '📊 This Month'}
              {p === 'year' && '📈 This Year'}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">⏳ Loading your performance data...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Average Score</div>
                <div className="stat-value">{data?.stats?.averageScore ?? 0}%</div>
                <div className="stat-subtext">{data?.stats?.totalEntries ?? 0} entries</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-label">Best Score</div>
                <div className="stat-value">{data?.stats?.bestScore ?? 0}%</div>
                <div className="stat-subtext">Highest performance</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-label">Talk Time</div>
                <div className="stat-value">{formatTime(data?.stats?.totalTalkTime ?? 0)}</div>
                <div className="stat-subtext">Total time spent</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">Logged In</div>
                <div className="stat-value">{formatTime(data?.stats?.totalLoggedInTime ?? 0)}</div>
                <div className="stat-subtext">Total logged time</div>
              </div>
            </div>
          </div>

          {/* Daily Records */}
          <div className="records-section">
            <h3>📋 Daily Records</h3>
            {Array.isArray(data?.data) && data.data.length > 0 ? (
              <div className="records-list">
                {(data.data || []).map((record, index) => {
                  // Safe access to record properties
                  const recordDate = record?.date ? new Date(record.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit',
                  }) : 'Unknown date';
                  
                  const performanceScore = record?.performanceScore ?? 0;
                  const talkTime = record?.talkTime ?? 0;
                  const loggedInTime = record?.loggedInTime ?? 0;
                  
                  return (
                    <div key={index} className="record-item">
                      <div className="record-date">{recordDate}</div>
                      <div className="record-details">
                        <div className="record-row">
                          <span className="label">Performance Score:</span>
                          <span className="value">{performanceScore}%</span>
                        </div>
                        <div className="record-row">
                          <span className="label">Talk Time:</span>
                          <span className="value">{formatTime(talkTime)}</span>
                        </div>
                        <div className="record-row">
                          <span className="label">Logged In:</span>
                          <span className="value">{formatTime(loggedInTime)}</span>
                        </div>
                      </div>
                      <div className={`score-badge ${performanceScore >= 25 ? 'good' : 'poor'}`}>
                        {performanceScore}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">No data available for this period</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PersonalDashboard;
