import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ManagerDashboard.css';

function ManagerDashboard() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalUploaded: 0,
    avgScore: 0,
  });

  // Fetch employees data
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/performance/top-performers?limit=1000');
      // ✅ PRODUCTION-SAFE: Multiple layers of fallback for undefined data
      const employees = Array.isArray(response?.data?.data) ? response.data.data : [];
      
      if (employees.length === 0) {
        // ✅ Handle empty data gracefully
        setAllEmployees([]);
        setTopPerformers([]);
        setStats({
          totalEmployees: 0,
          totalUploaded: 0,
          avgScore: 0,
        });
        return;
      }

      // ✅ Deduplicate with safe property access
      const unique = Array.from(
        employees.reduce((map, emp) => {
          if (!emp || typeof emp !== 'object') return map; // ✅ Skip invalid entries
          const empName = emp?.name;
          if (!empName) return map; // ✅ Skip if no name
          
          const existing = map.get(empName);
          const currentScore = parseFloat(emp?.performanceScore ?? 0);
          const existingScore = parseFloat(existing?.performanceScore ?? 0);
          
          if (!existing || currentScore > existingScore) {
            map.set(empName, emp);
          }
          return map;
        }, new Map()).values()
      ).sort((a, b) => {
        const scoreA = parseFloat(a?.performanceScore ?? 0);
        const scoreB = parseFloat(b?.performanceScore ?? 0);
        return scoreB - scoreA;
      });

      setAllEmployees(unique);
      setTopPerformers(unique?.slice(0, 5) ?? []);

      // ✅ Calculate stats with multiple safety checks
      if (Array.isArray(unique) && unique.length > 0) {
        const validScores = unique.filter(emp => {
          const score = emp?.performanceScore;
          return score != null && !isNaN(parseFloat(score));
        });

        const avgScore = validScores.length > 0
          ? (validScores.reduce((sum, emp) => {
              const score = parseFloat(emp?.performanceScore ?? 0);
              return sum + (isNaN(score) ? 0 : score);
            }, 0) / validScores.length).toFixed(2)
          : '0.00';

        setStats({
          totalEmployees: unique.length,
          totalUploaded: unique.length,
          avgScore: parseFloat(avgScore) ?? 0,
        });
      } else {
        setStats({
          totalEmployees: 0,
          totalUploaded: 0,
          avgScore: 0,
        });
      }
    } catch (err) {
      console.error('❌ Error fetching employees:', err);
      setUploadMessage('❌ Error loading employee data');
      // ✅ Reset to safe defaults on error
      setAllEmployees([]);
      setTopPerformers([]);
      setStats({ totalEmployees: 0, totalUploaded: 0, avgScore: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setUploadMessage('❌ Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadMessage('❌ File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setUploadMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('❌ Please select a file first.');
      return;
    }

    setUploading(true);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('dataDate', uploadDate);

    try {
      const response = await api.post('/api/v1/performance/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setUploadMessage(`✅ Success! Uploaded ${response.data.count} employee records`);
      setSelectedFile(null);

      // Refresh data
      setTimeout(() => {
        fetchEmployees();
        setUploadMessage('');
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Upload failed. Please try again.';
      setUploadMessage(`❌ ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="manager-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>📊 Performance Manager</h1>
        <p>Upload daily performance data and view top performers</p>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-card">
            <h2>📤 Upload Performance Data</h2>
            <p>Upload Excel (.xlsx) or CSV file with employee performance metrics</p>

            {/* File Upload Area */}
            <form
              className={`upload-area ${dragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-input"
                accept=".xlsx,.csv,.xls"
                onChange={handleChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />

              <div className="upload-content">
                <div className="upload-icon">📁</div>
                <h3>Drag and drop your file here</h3>
                <p>or click to select a file</p>
                <label htmlFor="file-input" className="upload-btn">
                  Choose File
                </label>
              </div>
            </form>

            {/* File Info - with safe size handling */}
            {selectedFile && (
              <div className="file-info">
                <div className="file-details">
                  <span className="file-icon">📄</span>
                  <div>
                    <p className="file-name">{selectedFile?.name ?? 'Unknown file'}</p>
                    <p className="file-size">
                      {selectedFile?.size && typeof selectedFile.size === 'number'
                        ? (selectedFile.size / 1024).toFixed(2)
                        : '0.00'} KB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Date Picker */}
            <div className="date-section">
              <label>Date of Performance Data:</label>
              <input
                type="date"
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                disabled={uploading}
                className="date-input"
              />
            </div>

            {/* Upload Button */}
            <button
              className={`upload-submit-btn ${uploading ? 'uploading' : ''}`}
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
            >
              {uploading ? '⏳ Uploading...' : '🚀 Upload & Process'}
            </button>

            {/* Messages */}
            {uploadMessage && (
              <div className={`upload-message ${uploadMessage.includes('✅') ? 'success' : 'error'}`}>
                {uploadMessage}
              </div>
            )}

            {/* Format Guide */}
            <div className="format-guide">
              <h4>📋 Required Columns:</h4>
              <ul>
                <li><strong>Agent Name</strong> - Employee name</li>
                <li><strong>Total Talk Time (hh:mm:ss)</strong> - Call time</li>
                <li><strong>Total Logged In Time (hh:mm:ss)</strong> - Login duration</li>
                <li><strong>Total Break Duration (hh:mm:ss)</strong> - Break time</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          {/* Stats - with safe property access */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.totalEmployees ?? 0}</div>
              <div className="stat-label">Total Employees</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {typeof stats?.avgScore === 'number' && !isNaN(stats.avgScore) 
                  ? stats.avgScore 
                  : '0.00'}
              </div>
              <div className="stat-label">Avg Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Array.isArray(topPerformers) ? topPerformers.length : 0}</div>
              <div className="stat-label">Top Performers</div>
            </div>
          </div>

          {/* Top 5 Performers - with full safety checks */}
          <div className="performers-card">
            <h2>🏆 Top 5 Performers</h2>
            {loading ? (
              <div className="loading">⏳ Loading employees...</div>
            ) : Array.isArray(topPerformers) && topPerformers.length > 0 ? (
              <div className="performers-list">
                {topPerformers.map((emp, idx) => {
                  // ✅ PRODUCTION-SAFE: Pre-compute all values with fallbacks
                  if (!emp || typeof emp !== 'object') return null;
                  
                  const empName = emp?.name ?? 'Unknown agent';
                  const perfScore = emp?.performanceScore;
                  const score = perfScore != null && !isNaN(parseFloat(perfScore))
                    ? parseFloat(perfScore).toFixed(2)
                    : '0.00';
                  
                  const empDate = emp?.date;
                  const date = empDate 
                    ? new Date(empDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'Unknown date';
                  
                  const empId = emp?._id ?? `unknown-${idx}`;
                  
                  return (
                    <div key={empId} className="performer-item">
                      <div className="performer-rank">
                        <span className="badge">{idx + 1}</span>
                      </div>
                      <div className="performer-info">
                        <h4>{empName}</h4>
                        <p className="date">{date}</p>
                      </div>
                      <div className="performer-score">
                        <div className="score-value">{score}</div>
                        <div className="score-label">Score</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">📭 No data. Upload a file first.</div>
            )}
          </div>

          {/* All Employees - with full safety checks */}
          <div className="all-employees-card">
            <h2>📋 All Employees ({Array.isArray(allEmployees) ? allEmployees.length : 0})</h2>
            {loading ? (
              <div className="loading">⏳ Loading employees...</div>
            ) : Array.isArray(allEmployees) && allEmployees.length > 0 ? (
              <div className="employees-table">
                <div className="table-header">
                  <div className="col-rank">Rank</div>
                  <div className="col-name">Name</div>
                  <div className="col-date">Date</div>
                  <div className="col-score">Score</div>
                </div>
                <div className="table-body">
                  {allEmployees.map((emp, idx) => {
                    // ✅ PRODUCTION-SAFE: Pre-compute all values with fallbacks before rendering
                    if (!emp || typeof emp !== 'object') return null;
                    
                    const empName = emp?.name ?? 'Unknown agent';
                    
                    const perfScore = emp?.performanceScore;
                    const score = perfScore != null && !isNaN(parseFloat(perfScore))
                      ? parseFloat(perfScore).toFixed(2)
                      : '0.00';
                    
                    const empDate = emp?.date;
                    const date = empDate
                      ? new Date(empDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'Unknown date';
                    
                    const empId = emp?._id ?? `unknown-${idx}`;
                    const isTopFive = idx < 5;
                    
                    return (
                      <div
                        key={empId}
                        className={`table-row ${isTopFive ? 'top-5' : ''}`}
                      >
                        <div className="col-rank">{idx + 1}</div>
                        <div className="col-name">{empName}</div>
                        <div className="col-date">{date}</div>
                        <div className="col-score">
                          <span className={`score-badge ${isTopFive ? 'gold' : ''}`}>
                            {score}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="no-data">📭 No employee data. Upload a file first.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
