import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">
              <FontAwesomeIcon icon="exclamation-circle" />
            </div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but there was an error in this part of the application.</p>
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()}
                className="retry-btn"
              >
                <FontAwesomeIcon icon="sync" /> Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="reset-btn"
              >
                <FontAwesomeIcon icon="redo" /> Try Again
              </button>
            </div>
            {this.props.showDetails && (
              <div className="error-details">
                <h4>Error Details:</h4>
                <p>{this.state.error && this.state.error.toString()}</p>
                <div className="stack-trace">
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 