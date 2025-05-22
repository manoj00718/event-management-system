const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Analytics = require('../models/Analytics');
const Event = require('../models/Event');

// Middleware to check if user is organizer or admin
const isOrganizerOrAdmin = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (req.user.role === 'admin' || event.organizer.toString() === req.user.id) {
      req.event = event;
      next();
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get event analytics
router.get('/events/:eventId', [auth, isOrganizerOrAdmin], async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ event: req.params.eventId });
    
    if (!analytics) {
      analytics = new Analytics({ event: req.params.eventId });
      await analytics.save();
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Track event view
router.post('/events/:eventId/views', async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ event: req.params.eventId });
    
    if (!analytics) {
      analytics = new Analytics({ event: req.params.eventId });
    }

    await analytics.incrementViews(req.body.isUnique);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update registration analytics
router.post('/events/:eventId/registrations', auth, isOrganizerOrAdmin, async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ event: req.params.eventId });
    
    if (!analytics) {
      analytics = new Analytics({ event: req.params.eventId });
    }

    await analytics.addRegistration(req.body.type);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update revenue analytics
router.post('/events/:eventId/revenue', auth, isOrganizerOrAdmin, async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ event: req.params.eventId });
    
    if (!analytics) {
      analytics = new Analytics({ event: req.params.eventId });
    }

    await analytics.updateRevenue(
      req.body.ticketType,
      req.body.price,
      req.body.quantity
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get event insights (summary)
router.get('/events/:eventId/insights', [auth, isOrganizerOrAdmin], async (req, res) => {
  try {
    const analytics = await Analytics.findOne({ event: req.params.eventId });
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }

    // Calculate additional insights
    const insights = {
      overview: {
        totalViews: analytics.views.total,
        uniqueViews: analytics.views.unique,
        registrations: analytics.registrations.total,
        revenue: analytics.revenue.total
      },
      trends: {
        views: analytics.views.history.slice(-7), // Last 7 days
        registrations: analytics.registrations.history.slice(-7)
      },
      engagement: {
        shares: analytics.engagement.shares.total,
        favorites: analytics.engagement.favorites,
        comments: analytics.engagement.comments
      },
      demographics: {
        topLocations: analytics.demographics.locations
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        devices: analytics.demographics.devices
      }
    };

    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get organizer dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (!['organizer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const events = await Event.find({ organizer: req.user.id });
    const eventIds = events.map(event => event._id);

    const analytics = await Analytics.aggregate([
      {
        $match: {
          event: { $in: eventIds }
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views.total' },
          totalRegistrations: { $sum: '$registrations.total' },
          totalRevenue: { $sum: '$revenue.total' },
          totalEvents: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await Analytics.find({ event: { $in: eventIds } })
      .sort({ 'lastUpdated': -1 })
      .limit(5)
      .populate('event', 'title date');

    res.json({
      summary: analytics[0] || {
        totalViews: 0,
        totalRegistrations: 0,
        totalRevenue: 0,
        totalEvents: 0
      },
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 