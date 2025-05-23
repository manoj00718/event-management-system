import React, { useState } from 'react';
import axios from 'axios';
import './QRCodeScanner.css';

const QRCodeScanner = ({ eventId }) => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  
  // This function would use a QR code scanning library in a real implementation
  // For now, we'll simulate it with manual input
  const startScanning = () => {
    setScanning(true);
    setScanResult(null);
    setError(null);
    
    // In a real implementation, we would initialize the camera and QR scanner here
    // For this example, we'll just show a text input field
  };
  
  const stopScanning = () => {
    setScanning(false);
    // In a real implementation, we would stop the camera and QR scanner here
  };
  
  const validateQRCode = async (qrData) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to validate QR codes');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(
        '/api/qr-codes/validate',
        { qrData },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setScanResult(response.data.validation);
      setLoading(false);
    } catch (err) {
      console.error('Error validating QR code:', err);
      setError(err.response?.data?.message || 'Failed to validate QR code');
      setLoading(false);
    }
  };
  
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      validateQRCode(manualInput);
    }
  };
  
  const handleScanAgain = () => {
    setScanResult(null);
    setError(null);
    setManualInput('');
  };

  return (
    <div className="qr-code-scanner">
      <h3>QR Code Check-in</h3>
      
      {!scanning && !scanResult && !error && (
        <button 
          className="scanner-button start"
          onClick={startScanning}
        >
          Start Scanning QR Codes
        </button>
      )}
      
      {scanning && (
        <div className="scanner-container">
          <p>Scan attendee's QR code to check them in</p>
          
          {/* This would be replaced with an actual QR scanner in production */}
          <form onSubmit={handleManualSubmit} className="manual-input-form">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Paste QR code data here"
              className="manual-input"
            />
            <button 
              type="submit" 
              className="scanner-button validate"
              disabled={loading}
            >
              {loading ? 'Validating...' : 'Validate'}
            </button>
          </form>
          
          <button 
            className="scanner-button cancel"
            onClick={stopScanning}
          >
            Cancel
          </button>
        </div>
      )}
      
      {scanResult && (
        <div className={`scan-result ${scanResult.valid ? 'success' : 'failure'}`}>
          <h4>{scanResult.valid ? 'Check-in Successful!' : 'Check-in Failed'}</h4>
          <p>{scanResult.message}</p>
          
          {scanResult.valid && scanResult.user && (
            <div className="attendee-info">
              <p><strong>Name:</strong> {scanResult.user.name}</p>
              <p><strong>Email:</strong> {scanResult.user.email}</p>
              <p><strong>Check-in time:</strong> {new Date(scanResult.checkedInAt).toLocaleTimeString()}</p>
            </div>
          )}
          
          <button 
            className="scanner-button scan-again"
            onClick={handleScanAgain}
          >
            Scan Another Code
          </button>
        </div>
      )}
      
      {error && (
        <div className="scan-error">
          <p>{error}</p>
          <button 
            className="scanner-button try-again"
            onClick={handleScanAgain}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner; 