import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MonthlyRewards.css';

function MonthlyRewards() {
  const [topPerformers, setTopPerformers] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMonthlyTop();
  }, [month, year]);

  const fetchMonthlyTop = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/dashboard/monthly-top', {
        params: { month, year },
      });
      setTopPerformers(response.data.topPerformers || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch monthly top performers');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const incentives = [
    { rank: 1, emoji: '🥇', amount: '₹5000', color: '#FFD700' },
    { rank: 2, emoji: '🥈', amount: '₹3000', color: '#C0C0C0' },
    { rank: 3, emoji: '🥉', amount: '₹2000', color: '#CD7F32' },
    { rank: 4, emoji: '⭐', amount: '₹1000', color: '#FFB700' },
    { rank: 5, emoji: '⭐', amount: '₹500', color: '#FFB700' },
  ];

  return (
    <div className="monthly-rewards">
      <div className="rewards-header">
        <h2>🎁 Monthly Top Performers</h2>
        <p className="subtitle">Incentive Awards & Recognition</p>

        <div className="month-selector">
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {months.map((m, idx) => (
              <option key={idx} value={idx + 1}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button onClick={fetchMonthlyTop} className="btn-refresh">🔄 Refresh</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading monthly top performers...</div>
      ) : topPerformers.length > 0 ? (
        <>
          <div className="rewards-container">
            {topPerformers.map((performer, index) => {
              const incentive = incentives[index] || incentives[4];
              return (
                <div key={index} className={`reward-card rank-${index + 1}`}>
                  <div className="card-header" style={{ borderTopColor: incentive.color }}>
                    <div className="rank-badge">{incentive.emoji}</div>
                    <div className="rank-text">Rank #{index + 1}</div>
                  </div>

                  <div className="card-body">
                    <h3 className="performer-name">{performer.name}</h3>
                    
                    <div className="score-section">
                      <div className="score-item">
                        <span className="score-label">Best Score</span>
                        <span className="score-value">{performer.performanceScore}%</span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">Avg Score</span>
                        <span className="score-value">{performer.avgScore}%</span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">Entries</span>
                        <span className="score-value">{performer.entries}</span>
                      </div>
                    </div>

                    <div className="incentive-section">
                      <div className="incentive-label">💰 Incentive</div>
                      <div className="incentive-amount">{incentive.amount}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="rewards-summary">
            <h3>📊 Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Incentive Pool</span>
                <span className="summary-value">₹11,500</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Top Performer</span>
                <span className="summary-value">{topPerformers[0]?.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Average Score (Top 5)</span>
                <span className="summary-value">
                  {(topPerformers.reduce((sum, p) => sum + p.performanceScore, 0) / topPerformers.length).toFixed(2)}%
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Highest Individual Score</span>
                <span className="summary-value">
                  {Math.max(...topPerformers.map(p => p.performanceScore))}%
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="no-data">No performance data available for this period</p>
      )}
    </div>
  );
}

export default MonthlyRewards;
