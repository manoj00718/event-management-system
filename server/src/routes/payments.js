const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createPaymentIntent,
  processSuccessfulPayment,
  processRefund
} = require('../utils/paymentService');
const Event = require('../models/Event');

/**
 * @route   POST /api/payments/create-payment-intent/:eventId
 * @desc    Create a payment intent for event registration
 * @access  Private
 */
router.post('/create-payment-intent/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    // Check if event exists and is paid
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    if (!event.isPaid || event.price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This is not a paid event'
      });
    }
    
    const paymentIntent = await createPaymentIntent(userId, eventId);
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating payment intent'
    });
  }
});

/**
 * @route   POST /api/payments/confirm/:paymentIntentId
 * @desc    Confirm successful payment and register for event
 * @access  Private
 */
router.post('/confirm/:paymentIntentId', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const result = await processSuccessfulPayment(paymentIntentId);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error confirming payment'
    });
  }
});

/**
 * @route   POST /api/payments/refund/:eventId
 * @desc    Process refund for event registration
 * @access  Private
 */
router.post('/refund/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    const result = await processRefund(userId, eventId);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing refund'
    });
  }
});

module.exports = router; 