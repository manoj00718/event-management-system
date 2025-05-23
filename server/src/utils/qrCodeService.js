// Mock QR code service implementation
// Removed QR code dependency to simplify the app

/**
 * Generate a mock QR code string for an event and user
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Mock QR code data URL
 */
const generateQRCode = async (eventId, userId) => {
  console.log('Mock QR code generated for:', { eventId, userId });
  return `mock-qr-code-${eventId}-${userId}-${Date.now()}`;
};

/**
 * Validate a QR code string
 * @param {string} qrData - QR code data
 * @returns {Promise<Object>} - Validation result
 */
const validateQRCode = async (qrData) => {
  console.log('Mock QR code validation for:', qrData);
  
  if (!qrData || !qrData.startsWith('mock-qr-code-')) {
    return { 
      valid: false, 
      message: 'Invalid QR code' 
    };
  }
  
  const parts = qrData.split('-');
  if (parts.length < 4) {
    return { 
      valid: false, 
      message: 'Malformed QR code' 
    };
  }
  
  return {
    valid: true,
    event: parts[2],
    user: parts[3],
    message: 'QR code valid'
  };
};

module.exports = {
  generateQRCode,
  validateQRCode
}; 