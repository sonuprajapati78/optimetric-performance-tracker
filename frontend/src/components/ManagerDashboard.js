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
      const employees = response.data.data || [];
      
      // Deduplicate and sort by score
      const unique = Array.from(
        employees.reduce((map, emp) => {
          const existing = map.get(emp.name);
          if (!existing || emp.performanceScore > existing.performanceScore) {
            map.set(emp.name, emp);
          }
          return map;
        }, new Map()).values()
      ).sort((a, b) => b.performanceScore - a.performanceScore);

      setAllEmployees(unique);
      setTopPerformers(unique.slice(0, 5));

      // Calculate stats
      if (unique.length > 0) {
        const avgScore = (unique.reduce((sum, emp) => sum + emp.performanceScore, 0) / unique.length).toFixed(2);
        setStats({
          totalEmployees: unique.length,
          totalUploaded: unique.length,
          avgScore: avgScore,
        });
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setUploadMessage('❌ Error loading employee data');
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

            {/* File Info */}
            {selectedFile && (
              <div className="file-info">
                <div className="file-details">
                  <span className="file-icon">📄</span>
                  <div>
                    <p className="file-name">{selectedFile.name}</p>
                    <p className="file-size">{(selectedFile.size / 1024).toFixed(2)} KB</p>
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
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalEmployees}</div>
              <div className="stat-label">Total Employees</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.avgScore}</div>
              <div className="stat-label">Avg Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{topPerformers.length}</div>
              <div className="stat-label">Top Performers</div>
            </div>
          </div>

          {/* Top 5 Performers */}
          <div className="performers-card">
            <h2>🏆 Top 5 Performers</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : topPerformers.length > 0 ? (
              <div className="performers-list">
                {topPerformers.map((emp, idx) => (
                  <div key={emp._id || idx} className="performer-item">
                    <div className="performer-rank">
                      <span className="badge">{idx + 1}</span>
                    </div>
                    <div className="performer-info">
                      <h4>{emp.name}</h4>
                      <p className="date">{new Date(emp.date).toLocaleDateString()}</p>
                    </div>
                    <div className="performer-score">
                      <div className="score-value">{emp.performanceScore.toFixed(2)}</div>
                      <div className="score-label">Score</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No data. Upload a file first.</div>
            )}
          </div>

          {/* All Employees */}
          <div className="all-employees-card">
            <h2>📋 All Employees ({allEmployees.length})</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : allEmployees.length > 0 ? (
              <div className="employees-table">
                <div className="table-header">
                  <div className="col-rank">Rank</div>
                  <div className="col-name">Name</div>
                  <div className="col-date">Date</div>
                  <div className="col-score">Score</div>
                </div>
                <div className="table-body">
                  {allEmployees.map((emp, idx) => (
                    <div
                      key={emp._id || idx}
                      className={`table-row ${idx < 5 ? 'top-5' : ''}`}
                    >
                      <div className="col-rank">{idx + 1}</div>
                      <div className="col-name">{emp.name}</div>
                      <div className="col-date">{new Date(emp.date).toLocaleDateString()}</div>
                      <div className="col-score">
                        <span className={`score-badge ${idx < 5 ? 'gold' : ''}`}>
                          {emp.performanceScore.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-data">No employee data. Upload a file first.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
