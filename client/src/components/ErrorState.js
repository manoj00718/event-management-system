import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/ErrorState.css';

/**
 * ErrorState component for displaying various error states in the UI
 * @param {Object} props Component props
 * @param {string} props.type Type of error ('not-found', 'permission', 'server', 'network', 'custom')
 * @param {string} props.title Custom error title
 * @param {string} props.message Custom error message
 * @param {string} props.icon Custom icon name
 * @param {Function} props.onRetry Function to call on retry
 * @param {string} props.retryText Custom text for retry button
 * @param {Function} props.onAction Additional action button callback
 * @param {string} props.actionText Text for additional action button
 */
const ErrorState = ({
  type = 'server',
  title,
  message,
  icon,
  onRetry,
  retryText = 'Try Again',
  onAction,
  actionText
}) => {
  // Default content based on error type
  const getDefaultContent = () => {
    switch (type) {
      case 'not-found':
        return {
          title: 'Resource Not Found',
          message: 'The requested resource could not be found.',
          icon: 'question-circle'
        };
      case 'permission':
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to access this resource.',
          icon: 'lock'
        };
      case 'network':
        return {
          title: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          icon: 'wifi-slash'
        };
      case 'server':
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          icon: 'server'
        };
      default:
        return {
          title: 'An Error Occurred',
          message: 'Please try again or contact support if the problem persists.',
          icon: 'exclamation-circle'
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;
  const displayIcon = icon || defaultContent.icon;

  return (
    <div className={`error-state ${type}`}>
      <div className="error-state-icon">
        <FontAwesomeIcon icon={displayIcon} />
      </div>
      <h3 className="error-state-title">{displayTitle}</h3>
      <p className="error-state-message">{displayMessage}</p>
      
      <div className="error-state-actions">
        {onRetry && (
          <button 
            className="retry-btn"
            onClick={onRetry}
          >
            <FontAwesomeIcon icon="sync" /> {retryText}
          </button>
        )}
        
        {onAction && (
          <button 
            className="action-btn"
            onClick={onAction}
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState; 