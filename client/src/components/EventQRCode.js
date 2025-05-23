import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import './EventQRCode.css';

const EventQRCode = ({ eventId }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (showQR) {
      generateQRCode();
    }
  }, [showQR, eventId]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to generate a QR code');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(
        `/api/qr-codes/generate/${eventId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setQrCode(response.data.qrCode);
      setLoading(false);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code. Please try again.');
      setLoading(false);
    }
  };
  
  const handleToggleQR = () => {
    setShowQR(!showQR);
  };

  return (
    <div className="event-qr-code">
      <button 
        className="qr-toggle-button" 
        onClick={handleToggleQR}
      >
        {showQR ? 'Hide Check-in QR Code' : 'Show Check-in QR Code'}
      </button>
      
      {showQR && (
        <div className="qr-code-container">
          {loading && <div className="loading">Generating QR code...</div>}
          {error && <div className="error">{error}</div>}
          
          {!loading && !error && qrCode && (
            <div className="qr-code-display">
              <img src={qrCode} alt="Event check-in QR code" />
              <p className="qr-instructions">
                Present this QR code to the event organizer for check-in
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventQRCode; 