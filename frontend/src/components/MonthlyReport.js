import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './MonthlyReport.css';

function MonthlyReport() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [];
  for (let i = new Date().getFullYear(); i >= 2020; i--) {
    years.push(i);
  }

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/v1/reports/monthly', {
        params: { month, year },
      });
      setReport(response.data);
    } catch (err) {
      setError('Failed to fetch monthly report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const response = await api.get('/api/v1/reports/monthly/export', {
        params: { month, year, format },
        responseType: format === 'csv' ? 'blob' : 'json',
      });

      if (format === 'csv') {
        // Create downloadable CSV file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report_${month}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentChild.removeChild(link);
      } else {
        // Download JSON
        const url = window.URL.createObjectURL(new Blob([JSON.stringify(response.data, null, 2)]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report_${month}_${year}.json`);
        document.body.appendChild(link);
        link.click();
        link.parentChild.removeChild(link);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className='monthly-report'>
        <div className='loading'>Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className='monthly-report'>
        <div className='error'>No data available</div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className='monthly-report'>
      <div className='report-container'>
        {/* Header */}
        <div className='report-header'>
          <h1>📊 Monthly Performance Report</h1>

          {/* Month/Year Selector */}
          <div className='selector-group'>
            <div className='selector'>
              <label>Month:</label>
              <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                {months.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className='selector'>
              <label>Year:</label>
              <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Export Buttons */}
          <div className='export-buttons'>
            <button
              className='export-btn csv'
              onClick={() => handleExport('csv')}
              disabled={exporting}
              title='Export as CSV'
            >
              📥 CSV
            </button>
            <button
              className='export-btn json'
              onClick={() => handleExport('json')}
              disabled={exporting}
              title='Export as JSON'
            >
              📥 JSON
            </button>
          </div>
        </div>

        {error && <div className='error-message'>{error}</div>}

        {/* Overall Statistics */}
        <div className='stats-grid'>
          <div className='stat-card'>
            <h3>📈 Total Records</h3>
            <p className='stat-value'>{report.statistics.totalRecords}</p>
          </div>
          <div className='stat-card'>
            <h3>👥 Employees</h3>
            <p className='stat-value'>{report.statistics.totalEmployees}</p>
          </div>
          <div className='stat-card'>
            <h3>⭐ Avg Score</h3>
            <p className='stat-value'>{report.statistics.averageScore}</p>
          </div>
          <div className='stat-card'>
            <h3>🏆 Highest Score</h3>
            <p className='stat-value'>{report.statistics.highestScore}</p>
          </div>
          <div className='stat-card'>
            <h3>📊 Median Score</h3>
            <p className='stat-value'>{report.statistics.medianScore}</p>
          </div>
          <div className='stat-card'>
            <h3>📉 Lowest Score</h3>
            <p className='stat-value'>{report.statistics.lowestScore}</p>
          </div>
        </div>

        {/* Top Performers */}
        {report.topPerformers && report.topPerformers.length > 0 && (
          <div className='top-performers-section'>
            <h2>🏅 Top 5 Performers</h2>
            <div className='performers-grid'>
              {report.topPerformers.map((performer, idx) => (
                <div key={idx} className={`performer-card rank-${performer.rank}`}>
                  <div className='performer-rank'>
                    <span className='medal'>{performer.medal}</span>
                    <span className='rank-number'>#{performer.rank}</span>
                  </div>
                  <h3>{performer.employeeName}</h3>
                  <div className='performer-stats'>
                    <div className='stat'>
                      <span className='label'>Avg Score</span>
                      <span className='value'>{performer.avgScore}</span>
                    </div>
                    <div className='stat'>
                      <span className='label'>Max Score</span>
                      <span className='value'>{performer.maxScore}</span>
                    </div>
                    <div className='stat'>
                      <span className='label'>Records</span>
                      <span className='value'>{performer.recordCount}</span>
                    </div>
                  </div>
                  <div className='incentive'>
                    <span className='label'>Incentive</span>
                    <span className='amount'>₹{performer.incentive}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Employees */}
        <div className='all-employees-section'>
          <h2>👥 All Employees Performance</h2>
          <div className='employees-table'>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Employee Name</th>
                  <th>Avg Score</th>
                  <th>Max Score</th>
                  <th>Min Score</th>
                  <th>Records</th>
                  <th>Talk Time</th>
                  <th>Logged In</th>
                  <th>Consistency</th>
                </tr>
              </thead>
              <tbody>
                {report.employees.map((emp, idx) => (
                  <tr key={idx} className={idx < 5 ? 'top-performer' : ''}>
                    <td className='rank'>
                      <span className='rank-badge'>#{idx + 1}</span>
                    </td>
                    <td className='name'>{emp.employeeName}</td>
                    <td className='score score-avg'>{emp.avgScore}</td>
                    <td className='score score-max'>{emp.maxScore}</td>
                    <td className='score score-min'>{emp.minScore}</td>
                    <td className='records'>{emp.recordCount}</td>
                    <td className='time'>{formatTime(emp.totalTalkTime)}</td>
                    <td className='time'>{formatTime(emp.totalLoggedInTime)}</td>
                    <td className='consistency'>
                      <div className='consistency-bar'>
                        <div
                          className='consistency-fill'
                          style={{ width: `${emp.consistency}%` }}
                        ></div>
                      </div>
                      <span>{emp.consistency}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generated Info */}
        <div className='report-footer'>
          <p>
            📅 Report generated on {new Date(report.generatedAt).toLocaleString()} | Period:{' '}
            {new Date(report.startDate).toLocaleDateString()} -{' '}
            {new Date(report.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MonthlyReport;
