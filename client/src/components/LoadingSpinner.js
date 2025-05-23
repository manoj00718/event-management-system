import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  }[size];

  const colorClass = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    white: 'spinner-white'
  }[color];

  return (
    <div className={`loading-spinner ${sizeClass} ${colorClass}`}>
      <FontAwesomeIcon icon="spinner" spin />
    </div>
  );
};

export default LoadingSpinner; 