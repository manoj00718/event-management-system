const express = require('express');
const router = express.Router();
const { generateQRCode, validateQRCode } = require('../utils/qrCodeService');
const { auth } = require('../middleware/auth');

/**
 * @route   POST /api/qr-codes/generate/:eventId
 * @desc    Generate a QR code for event registration
 * @access  Private
 */
router.post('/generate/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    const qrCodeDataUrl = await generateQRCode(userId, eventId);
    
    res.status(200).json({
      success: true,
      qrCode: qrCodeDataUrl
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating QR code'
    });
  }
});

/**
 * @route   POST /api/qr-codes/validate
 * @desc    Validate a QR code for event check-in
 * @access  Private (organizer only)
 */
router.post('/validate', auth, async (req, res) => {
  try {
    // Check if user is an organizer or admin
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only organizers can validate QR codes.'
      });
    }
    
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }
    
    const validationResult = await validateQRCode(qrData);
    
    res.status(200).json({
      success: true,
      validation: validationResult
    });
  } catch (error) {
    console.error('Error validating QR code:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error validating QR code'
    });
  }
});

module.exports = router; 