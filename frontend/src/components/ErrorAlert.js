import React, { useEffect } from 'react';
import './ErrorAlert.css';

function ErrorAlert({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="error-alert">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <span className="error-message">{message}</span>
        <button className="error-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}

export default ErrorAlert;
