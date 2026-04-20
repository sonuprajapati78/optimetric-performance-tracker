import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

function Dashboard({ topPerformers, stats, onRefresh }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch employees for selected date
  useEffect(() => {
    const fetchEmployeesForDate = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/v1/reports/daily?date=${selectedDate}`);
        const employees = Array.isArray(response?.data?.employees) ? response.data.employees : [];
        const sorted = employees.sort((a, b) => {
          const aScore = parseFloat(a?.avgScore ?? 0);
          const bScore = parseFloat(b?.avgScore ?? 0);
          return bScore - aScore;
        });
        setEmployeesData(sorted);
      } catch (err) {
        console.error('Error fetching data for date:', err);
        setEmployeesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeesForDate();
  }, [selectedDate]);

  // Get top 5 performers for highlighting
  const top5Names = new Set((employeesData || []).slice(0, 5).map(e => e?.employeeName).filter(Boolean));

  // Deduplicate performers by name (keep highest score for each agent)
  const deduplicatedPerformers = Array.isArray(topPerformers) 
    ? Array.from(
        (topPerformers || [])
          .filter(p => p != null) // Filter out null/undefined
          .reduce((map, performer) => {
            const name = performer?.name;
            if (!name) return map; // Skip if no name
            const existing = map.get(name);
            const perfScore = parseFloat(performer?.performanceScore ?? 0);
            if (!existing || perfScore > parseFloat(existing?.performanceScore ?? 0)) {
              map.set(name, performer);
            }
            return map;
          }, new Map())
          .values()
      ).sort((a, b) => parseFloat(b?.performanceScore ?? 0) - parseFloat(a?.performanceScore ?? 0))
    : [];

  // Prepare data for pie chart (ALL unique performers)
  const allPerformersForPie = deduplicatedPerformers || [];
  const pieColors = [
    'rgba(255, 107, 107, 0.8)',
    'rgba(255, 193, 7, 0.8)',
    'rgba(76, 175, 80, 0.8)',
    'rgba(33, 150, 243, 0.8)',
    'rgba(156, 39, 176, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
  ];
  const pieBorderColors = [
    'rgba(255, 107, 107, 1)',
    'rgba(255, 193, 7, 1)',
    'rgba(76, 175, 80, 1)',
    'rgba(33, 150, 243, 1)',
    'rgba(156, 39, 176, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
  ];
  
  const pieData = {
    labels: (allPerformersForPie ?? []).map(p => p?.name ?? 'Unknown'),
    datasets: [
      {
        data: (allPerformersForPie ?? []).map(p => parseFloat(p?.performanceScore ?? 0)),
        backgroundColor: (allPerformersForPie ?? []).map((_, idx) => pieColors[idx % pieColors.length]),
        borderColor: (allPerformersForPie ?? []).map((_, idx) => pieBorderColors[idx % pieBorderColors.length]),
        borderWidth: 2,
      },
    ],
  };

  // Prepare data for bar chart (all unique performers with color differentiation)
  const allPerformers = deduplicatedPerformers || [];
  const barData = {
    labels: (allPerformers ?? []).map(p => p?.name ?? 'Unknown'),
    datasets: [
      {
        label: 'Performance Score',
        data: (allPerformers ?? []).map(p => parseFloat(p?.performanceScore ?? 0)),
        backgroundColor: (allPerformers ?? []).map((p, idx) => 
          idx < 5 ? 'rgba(102, 126, 234, 0.9)' : 'rgba(102, 126, 234, 0.5)'
        ),
        borderColor: (allPerformers ?? []).map((p, idx) => 
          idx < 5 ? 'rgba(102, 126, 234, 1)' : 'rgba(102, 126, 234, 0.7)'
        ),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: undefined,
    plugins: {
      legend: {
        labels: {
          color: '#666',
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            return label.length > 15 ? label.substring(0, 15) + '...' : label;
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="dashboard-title">
        <h2>� Daily Performance</h2>
      </div>

      {/* Date Selector */}
      <div className="date-selector-section">
        <label htmlFor="date-input">Select Date: </label>
        <input 
          id="date-input"
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Employee List with Scores */}
      <div className="employees-list-section">
        <h3>Employees ({employeesData.length})</h3>
        
        {loading ? (
          <p className="loading">Loading...</p>
        ) : employeesData.length > 0 ? (
          <div className="employees-grid">
            {employeesData.map((employee, index) => {
              const isTop5 = top5Names.has(employee.employeeName);
              const avgScore = parseFloat(employee.avgScore);
              const rank = index + 1;
              
              return (
                <div 
                  key={index} 
                  className={`employee-card ${isTop5 ? 'top-performer' : ''}`}
                >
                  {isTop5 && <div className="green-badge">✓ Top Performer</div>}
                  
                  <div className="employee-rank">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank <= 5 ? '⭐' : '•'} #{rank}
                  </div>
                  
                  <div className="employee-name">{employee.employeeName}</div>
                  
                  <div className="employee-score">
                    <div className="score-bar" style={{width: `${avgScore}%`, backgroundColor: isTop5 ? '#4CAF50' : '#667EEA'}}></div>
                    <span className="score-value">{avgScore.toFixed(2)}%</span>
                  </div>

                  <div className="employee-stats">
                    <div className="stat">
                      <span className="stat-label">Records</span>
                      <span className="stat-val">{employee.recordCount}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Talk Time</span>
                      <span className="stat-val">{employee.avgTalkTime} sec</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-data">No data for selected date</p>
        )}
      </div>

      {/* Stats Summary */}
      {employeesData.length > 0 && (
        <div className="stats-summary">
          <h3>Summary</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon">👥</div>
              <div className="summary-content">
                <div className="summary-label">Total Employees</div>
                <div className="summary-value">{employeesData.length}</div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">⭐</div>
              <div className="summary-content">
                <div className="summary-label">Average Score</div>
                <div className="summary-value">
                  {(employeesData.reduce((sum, e) => sum + parseFloat(e.avgScore), 0) / employeesData.length).toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">🏆</div>
              <div className="summary-content">
                <div className="summary-label">Highest Score</div>
                <div className="summary-value">
                  {Math.max(...employeesData.map(e => parseFloat(e.avgScore))).toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">📉</div>
              <div className="summary-content">
                <div className="summary-label">Lowest Score</div>
                <div className="summary-value">
                  {Math.min(...employeesData.map(e => parseFloat(e.avgScore))).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
