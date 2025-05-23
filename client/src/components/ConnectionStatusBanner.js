import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/ConnectionStatusBanner.css';

const ConnectionStatusBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServerAvailable, setIsServerAvailable] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  
  // Check online status and setup listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkServerAvailability();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setIsServerAvailable(false);
      setIsVisible(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    checkServerAvailability();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check if server is available
  const checkServerAvailability = async () => {
    if (!navigator.onLine) {
      setIsServerAvailable(false);
      setIsVisible(true);
      return;
    }
    
    try {
      // Try to fetch from API base URL to check server availability
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const fetchPromise = fetch(process.env.REACT_APP_API_URL || 'http://localhost:5000/api/health');
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (response.ok) {
        setIsServerAvailable(true);
        // Keep banner visible for offline mode, hide for online mode
        setIsVisible(false);
      } else {
        setIsServerAvailable(false);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Server availability check failed:', error);
      setIsServerAvailable(false);
      setIsVisible(true);
    }
  };
  
  const handleDismiss = () => {
    setIsVisible(false);
  };
  
  const handleRetry = () => {
    checkServerAvailability();
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={`connection-banner ${isOnline ? (isServerAvailable ? 'success' : 'warning') : 'error'}`}>
      <div className="banner-content">
        <div className="banner-icon">
          {isOnline ? (
            isServerAvailable ? (
              <FontAwesomeIcon icon="check-circle" />
            ) : (
              <FontAwesomeIcon icon="exclamation-triangle" />
            )
          ) : (
            <FontAwesomeIcon icon="exclamation-circle" />
          )}
        </div>
        
        <div className="banner-message">
          {isOnline ? (
            isServerAvailable ? (
              <span>Connected to server</span>
            ) : (
              <>
                <span>Connected to internet, but server is unavailable</span>
                <p className="banner-submessage">Using demo data for preview</p>
              </>
            )
          ) : (
            <>
              <span>You are offline</span>
              <p className="banner-submessage">Using cached data for preview</p>
            </>
          )}
        </div>
      </div>
      
      <div className="banner-actions">
        {!isServerAvailable && (
          <button className="retry-button" onClick={handleRetry}>
            <FontAwesomeIcon icon="sync" /> Retry
          </button>
        )}
        
        <button className="dismiss-button" onClick={handleDismiss}>
          <FontAwesomeIcon icon="times" />
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatusBanner; 