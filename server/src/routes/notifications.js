const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('event', 'title date');

    const total = await Notification.countDocuments({ recipient: req.user.id });
    const unreadCount = await Notification.getUnreadCount(req.user.id);

    res.json({
      notifications,
      total,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.markAsRead();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.remove();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update notification preferences
router.patch('/preferences', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id });
    
    for (const notification of notifications) {
      notification.deliveryMethod = {
        ...notification.deliveryMethod,
        ...req.body
      };
      await notification.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread notifications count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 