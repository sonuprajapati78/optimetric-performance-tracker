import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './UploadManager.css';

function UploadManager({ user }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [overwriteDate, setOverwriteDate] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch upload history on component mount
  useEffect(() => {
    fetchUploadHistory();
    // Refresh history every 30 seconds
    const interval = setInterval(fetchUploadHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUploadHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get('/api/v1/uploads/history', {
        params: {
          limit: 10,
          page: 1,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUploadHistory(response.data.uploads);
    } catch (error) {
      console.error('Failed to fetch upload history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

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
    setUploadedFile(file);
    setUploadMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('❌ Please select a file first.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('dataDate', uploadDate);
    formData.append('allowDuplicates', allowDuplicates);
    formData.append('overwriteDate', overwriteDate);

    try {
      const response = await api.post('/api/v1/uploads/performance', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setUploadMessage(
        `✅ Success! Uploaded ${response.data.count} records for ${response.data.dataDate}`
      );
      setSelectedFile(null);
      setUploadedFile(null);
      setUploadProgress(0);

      // Refresh history
      setTimeout(() => {
        fetchUploadHistory();
      }, 1000);

      // Auto-clear message after 5 seconds
      setTimeout(() => {
        setUploadMessage('');
      }, 5000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Upload failed. Please try again.';
      setUploadMessage(`❌ ${errorMsg}`);

      // If duplicate, show option to force upload
      if (error.response?.status === 409) {
        setUploadMessage(
          `⚠️ ${errorMsg}\n\nCheck "Allow Duplicates" to force re-upload this file.`
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badgeStyles = {
      success: '✅',
      partial_success: '⚠️',
      failed: '❌',
      processing: '⏳',
    };
    return badgeStyles[status] || '❓';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='upload-manager'>
      <div className='upload-container'>
        {/* Upload Section */}
        <div className='upload-card'>
          <h2>📤 Upload Performance Data</h2>
          <p className='subtitle'>Upload daily performance data using Excel or CSV files.</p>

          {/* File Input */}
          <form
            className={`upload-area ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type='file'
              id='file-input'
              accept='.xlsx,.csv,.xls'
              onChange={handleChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />

            <div className='upload-content'>
              <div className='upload-icon'>📁</div>
              <h3>Drag and drop your file</h3>
              <p>or click to select</p>
              <label htmlFor='file-input' className='file-label'>
                Choose File
              </label>
            </div>
          </form>

          {/* File Info */}
          {uploadedFile && (
            <div className='file-info'>
              <div className='file-details'>
                <span className='file-icon'>📄</span>
                <div>
                  <p className='file-name'>{uploadedFile.name}</p>
                  <p className='file-size'>{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Options */}
          <div className='upload-options'>
            <div className='option-group'>
              <label htmlFor='upload-date'>Data Date:</label>
              <input
                id='upload-date'
                type='date'
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className='checkbox-group'>
              <label>
                <input
                  type='checkbox'
                  checked={allowDuplicates}
                  onChange={(e) => setAllowDuplicates(e.target.checked)}
                  disabled={uploading}
                />
                Allow duplicate uploads
              </label>
              <label>
                <input
                  type='checkbox'
                  checked={overwriteDate}
                  onChange={(e) => setOverwriteDate(e.target.checked)}
                  disabled={uploading}
                />
                Overwrite existing data for this date
              </label>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className='upload-progress'>
              <div className='progress-bar'>
                <div className='progress-fill' style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p>{uploadProgress}% - Uploading...</p>
            </div>
          )}

          {/* Action Button */}
          <button
            className='upload-button'
            onClick={handleUpload}
            disabled={!uploadedFile || uploading}
          >
            {uploading ? '⏳ Uploading...' : '🚀 Upload'}
          </button>

          {/* Upload Message */}
          {uploadMessage && (
            <div
              className={`upload-message ${
                uploadMessage.includes('❌') ? 'error' : uploadMessage.includes('⚠️') ? 'warning' : 'success'
              }`}
            >
              {uploadMessage}
            </div>
          )}

          {/* File Format Info */}
          <div className='file-format-info'>
            <h4>📋 Required File Format</h4>
            <p>Your file must contain these columns:</p>
            <ul>
              <li>
                <strong>Agent Name</strong> - Employee/Agent identifier (required)
              </li>
              <li>
                <strong>Total Talk Time (hh:mm:ss)</strong> - Time spent on calls
              </li>
              <li>
                <strong>Total Logged In Time (hh:mm:ss)</strong> - Total logged in duration
              </li>
              <li>
                <strong>Total Break Duration (hh:mm:ss)</strong> - Break time (optional)
              </li>
            </ul>
            <p className='hint'>
              💡 The upload date defaults to today. You can change it using the date picker above.
            </p>
          </div>
        </div>

        {/* Upload History Section */}
        <div className='history-card'>
          <div className='history-header'>
            <h3>📋 Upload History</h3>
            <button
              className='refresh-button'
              onClick={fetchUploadHistory}
              disabled={loadingHistory}
              title='Refresh upload history'
            >
              🔄 {loadingHistory ? 'Loading...' : 'Refresh'}
            </button>
            <button
              className='toggle-button'
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? '▼ Hide' : '▶ Show'}
            </button>
          </div>

          {showHistory && (
            <div className='history-list'>
              {uploadHistory.length === 0 ? (
                <p className='no-history'>No uploads yet. Start by uploading your first file!</p>
              ) : (
                uploadHistory.map((upload) => (
                  <div key={upload._id} className={`history-item ${upload.status}`}>
                    <div className='item-header'>
                      <span className='status-badge'>{getStatusBadge(upload.status)}</span>
                      <span className='file-name'>{upload.fileName}</span>
                      <span className='date'>{formatDate(upload.uploadDate)}</span>
                    </div>
                    <div className='item-details'>
                      <p>
                        <strong>Records:</strong> {upload.recordsProcessed} processed, {upload.recordsFailed}{' '}
                        failed
                      </p>
                      <p>
                        <strong>Data Date:</strong> {new Date(upload.dataDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Success Rate:</strong> {upload.successRate}%
                      </p>
                      {upload.isDuplicate && (
                        <p className='duplicate-notice'>
                          ⚠️ This is a duplicate of a previous upload
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadManager;
