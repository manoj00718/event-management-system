const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Event = require('../models/Event');
const { body, validationResult } = require('express-validator');

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('favoriteEvents', 'title date location image');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.patch('/me', auth, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('location').optional().trim(),
  body('preferences.notifications').optional().isObject(),
  body('preferences.displayMode').optional().isIn(['light', 'dark', 'system']),
  body('socialLinks').optional().isObject()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const allowedUpdates = [
      'name', 'bio', 'location', 'preferences', 'socialLinks', 'profileImage'
    ];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add event to favorites
router.post('/favorites/:eventId', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.favoriteEvents.includes(event._id)) {
      return res.status(400).json({ error: 'Event already in favorites' });
    }

    user.favoriteEvents.push(event._id);
    await user.save();

    res.json({ message: 'Event added to favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove event from favorites
router.delete('/favorites/:eventId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favoriteEvents = user.favoriteEvents.filter(
      eventId => eventId.toString() !== req.params.eventId
    );
    await user.save();

    res.json({ message: 'Event removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's favorite events
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'favoriteEvents',
        select: 'title date location image price category status',
        match: { status: { $ne: 'cancelled' } }
      });

    res.json(user.favoriteEvents);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update notification preferences
router.patch('/preferences/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.preferences.notifications = {
      ...user.preferences.notifications,
      ...req.body
    };
    await user.save();

    res.json(user.preferences.notifications);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update display mode
router.patch('/preferences/display-mode', auth, [
  body('mode').isIn(['light', 'dark', 'system'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);
    user.preferences.displayMode = req.body.mode;
    await user.save();

    res.json({ displayMode: user.preferences.displayMode });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 