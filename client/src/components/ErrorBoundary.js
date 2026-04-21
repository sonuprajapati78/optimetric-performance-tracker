import React from 'react';

/**
 * Error Boundary Component
 * Catches React errors anywhere in the child component tree
 * Prevents entire app from crashing due to a single component failure
 * 
 * Usage: Wrap your App or specific sections with this component
 * <ErrorBoundary><YourComponent /></ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error Boundary caught an error:');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.errorContainer}>
          <div style={styles.errorContent}>
            <div style={styles.errorIcon}>❌</div>
            <h2 style={styles.errorTitle}>Oops! Something went wrong</h2>
            <p style={styles.errorMessage}>
              We encountered an error while loading this page. 
              {this.state.errorCount > 2 && ' (This error occurred multiple times)'}
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details style={styles.errorDetails}>
                <summary style={styles.errorSummary}>📋 Error Details (Development Only)</summary>
                <pre style={styles.errorStack}>
                  {this.state.error && this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={styles.errorActions}>
              <button 
                onClick={this.handleReset}
                style={styles.button}
              >
                🔄 Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                🏠 Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
  },
  errorContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px',
  },
  errorMessage: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  errorDetails: {
    marginTop: '20px',
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  errorSummary: {
    fontWeight: '600',
    color: '#555',
    cursor: 'pointer',
  },
  errorStack: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '12px',
    color: '#d32f2f',
    fontFamily: 'monospace',
    maxHeight: '300px',
  },
  errorActions: {
    marginTop: '30px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: '#667eea',
    color: 'white',
    transition: 'background-color 0.3s',
  },
  buttonSecondary: {
    backgroundColor: '#ccc',
    color: '#333',
  },
};

export default ErrorBoundary;
