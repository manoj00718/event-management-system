const qrcode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');
const Event = require('../models/Event');

/**
 * Generate a QR code for a user's event registration
 * @param {string} userId - The user's ID
 * @param {string} eventId - The event's ID
 * @returns {Promise<string>} - The QR code data URL
 */
const generateQRCode = async (userId, eventId) => {
  try {
    // Generate a unique code for this registration
    const uniqueCode = crypto.randomBytes(16).toString('hex');
    
    // Create a payload with the necessary information
    const payload = {
      userId,
      eventId,
      uniqueCode,
      timestamp: Date.now()
    };
    
    // Convert payload to JSON string
    const payloadString = JSON.stringify(payload);
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await qrcode.toDataURL(payloadString);
    
    // Save QR code to user's profile
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if QR code already exists for this event
    const existingQRIndex = user.qrCodes.findIndex(qr => qr.eventId.toString() === eventId);
    
    if (existingQRIndex > -1) {
      // Update existing QR code
      user.qrCodes[existingQRIndex].code = uniqueCode;
      user.qrCodes[existingQRIndex].issuedAt = new Date();
      user.qrCodes[existingQRIndex].isUsed = false;
      user.qrCodes[existingQRIndex].usedAt = null;
    } else {
      // Add new QR code
      user.qrCodes.push({
        eventId,
        code: uniqueCode,
        issuedAt: new Date(),
        isUsed: false
      });
    }
    
    await user.save();
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Validate a QR code for event check-in
 * @param {string} qrData - The QR code data
 * @returns {Promise<Object>} - The validation result
 */
const validateQRCode = async (qrData) => {
  try {
    // Parse the QR code data
    const payload = JSON.parse(qrData);
    const { userId, eventId, uniqueCode } = payload;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return { valid: false, message: 'User not found' };
    }
    
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return { valid: false, message: 'Event not found' };
    }
    
    // Check if user is registered for the event
    const isRegistered = event.attendees.some(attendee => 
      attendee.user.toString() === userId
    );
    
    if (!isRegistered) {
      return { valid: false, message: 'User not registered for this event' };
    }
    
    // Find the QR code in the user's profile
    const qrCodeIndex = user.qrCodes.findIndex(qr => 
      qr.eventId.toString() === eventId && qr.code === uniqueCode
    );
    
    if (qrCodeIndex === -1) {
      return { valid: false, message: 'Invalid QR code' };
    }
    
    // Check if QR code has already been used
    if (user.qrCodes[qrCodeIndex].isUsed) {
      return { valid: false, message: 'QR code already used', checkedInAt: user.qrCodes[qrCodeIndex].usedAt };
    }
    
    // Mark QR code as used
    user.qrCodes[qrCodeIndex].isUsed = true;
    user.qrCodes[qrCodeIndex].usedAt = new Date();
    await user.save();
    
    // Mark user as checked in for the event
    const attendeeIndex = event.attendees.findIndex(attendee => 
      attendee.user.toString() === userId
    );
    
    event.attendees[attendeeIndex].checkedIn = true;
    event.attendees[attendeeIndex].checkedInAt = new Date();
    
    // Update event analytics
    event.analytics.checkInRate = (event.attendees.filter(a => a.checkedIn).length / event.attendees.length) * 100;
    
    await event.save();
    
    return { 
      valid: true, 
      message: 'Check-in successful', 
      user: {
        name: user.name,
        email: user.email
      },
      event: {
        title: event.title,
        date: event.date
      },
      checkedInAt: new Date()
    };
  } catch (error) {
    console.error('Error validating QR code:', error);
    return { valid: false, message: 'Invalid QR code format' };
  }
};

module.exports = {
  generateQRCode,
  validateQRCode
}; 