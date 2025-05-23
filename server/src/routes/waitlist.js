const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Event = require('../models/Event');
const { sendWaitlistNotifications } = require('../utils/notificationService');

/**
 * @route   POST /api/waitlist/:eventId/join
 * @desc    Join the waitlist for an event
 * @access  Private
 */
router.post('/:eventId/join', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if event is full
    if (event.attendees.length < event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is not full, you can register directly'
      });
    }
    
    // Check if user is already registered
    const isRegistered = event.attendees.some(attendee => 
      attendee.user.toString() === userId
    );
    
    if (isRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }
    
    // Check if user is already on the waitlist
    const isOnWaitlist = event.waitlist.some(entry => 
      entry.user.toString() === userId
    );
    
    if (isOnWaitlist) {
      return res.status(400).json({
        success: false,
        message: 'You are already on the waitlist for this event'
      });
    }
    
    // Add user to waitlist
    event.waitlist.push({
      user: userId,
      joinedAt: new Date()
    });
    
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'You have been added to the waitlist',
      position: event.waitlist.length
    });
  } catch (error) {
    console.error('Error joining waitlist:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error joining waitlist'
    });
  }
});

/**
 * @route   DELETE /api/waitlist/:eventId/leave
 * @desc    Leave the waitlist for an event
 * @access  Private
 */
router.delete('/:eventId/leave', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is on the waitlist
    const waitlistIndex = event.waitlist.findIndex(entry => 
      entry.user.toString() === userId
    );
    
    if (waitlistIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not on the waitlist for this event'
      });
    }
    
    // Remove user from waitlist
    event.waitlist.splice(waitlistIndex, 1);
    
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'You have been removed from the waitlist'
    });
  } catch (error) {
    console.error('Error leaving waitlist:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error leaving waitlist'
    });
  }
});

/**
 * @route   POST /api/waitlist/:eventId/notify
 * @desc    Notify users on waitlist when spots become available
 * @access  Private (organizer only)
 */
router.post('/:eventId/notify', auth, async (req, res) => {
  try {
    // Check if user is an organizer or admin
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only organizers can send waitlist notifications.'
      });
    }
    
    const { eventId } = req.params;
    const { spotsAvailable = 1 } = req.body;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if there are spots available
    const availableSpots = event.capacity - event.attendees.length;
    
    if (availableSpots <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No spots available for this event'
      });
    }
    
    // Check if there are users on the waitlist
    if (event.waitlist.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users on the waitlist'
      });
    }
    
    // Send notifications to users on waitlist
    const result = await sendWaitlistNotifications(eventId, Math.min(availableSpots, spotsAvailable));
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error sending waitlist notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending waitlist notifications'
    });
  }
});

/**
 * @route   GET /api/waitlist/:eventId
 * @desc    Get waitlist for an event
 * @access  Private (organizer only)
 */
router.get('/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Check if event exists
    const event = await Event.findById(eventId).populate('waitlist.user', 'name email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is the organizer or admin
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the event organizer can view the waitlist.'
      });
    }
    
    res.status(200).json({
      success: true,
      count: event.waitlist.length,
      waitlist: event.waitlist
    });
  } catch (error) {
    console.error('Error getting waitlist:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting waitlist'
    });
  }
});

module.exports = router; 