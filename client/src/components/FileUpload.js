import React, { useState } from 'react';
import api from '../services/api';
import './FileUpload.css';

function FileUpload({ onUploadSuccess, onUploadError }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      onUploadError('Invalid file type. Please upload an Excel (.xlsx) or CSV file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onUploadError('File size exceeds 10MB limit.');
      return;
    }

    setUploadedFile(file);
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/v1/performance/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadMessage(`✅ ${response.data.message} (${response.data.count} agents uploaded)`);
      onUploadSuccess(response.data.message);
      setTimeout(() => {
        setUploadMessage('');
        setUploadedFile(null);
      }, 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Upload failed. Please try again.';
      onUploadError(errorMsg);
      setUploadMessage(`❌ ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <div className="upload-card">
        <h2>📤 Upload Performance Data</h2>
        <p className="upload-subtitle">Upload an Excel (.xlsx) or CSV file with agent performance metrics.</p>

        <form
          className={`upload-area ${dragActive ? 'active' : ''}`}
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
            <label htmlFor="file-input" className="file-label">
              Choose File
            </label>
          </div>
        </form>

        {uploadedFile && (
          <div className="file-info">
            <div className="file-details">
              <span className="file-icon">📄</span>
              <div>
                <p className="file-name">{uploadedFile.name}</p>
                <p className="file-size">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          </div>
        )}

        {uploadMessage && (
          <div className={`upload-message ${uploadMessage.includes('✅') ? 'success' : 'error'}`}>
            {uploadMessage}
          </div>
        )}

        {uploading && (
          <div className="uploading">
            <div className="spinner"></div>
            <p>Uploading... Please wait</p>
          </div>
        )}

        <div className="file-format">
          <h4>📋 Required File Format</h4>
          <p>Your file should contain these columns:</p>
          <ul>
            <li><strong>Agent Name</strong> - Agent identifier (required)</li>
            <li><strong>Total Talk Time (hh:mm:ss)</strong> - Time spent talking</li>
            <li><strong>Total Logged In Time (hh:mm:ss)</strong> - Total logged in time</li>
            <li><strong>Total Break Duration (hh:mm:ss)</strong> - Time on break</li>
          </ul>
        </div>

        <div className="file-tips">
          <h4>💡 Tips</h4>
          <ul>
            <li>Maximum file size: 10 MB</li>
            <li>Supported formats: .xlsx, .csv</li>
            <li>Make sure all required columns are present</li>
            <li>Use HH:MM:SS format for time fields</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
