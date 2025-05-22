const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all events with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create event (organizer only)
router.post('/',
  [auth, authorize('organizer', 'admin')],
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
    body('category').isIn(['conference', 'workshop', 'seminar', 'networking', 'other'])
      .withMessage('Invalid category')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const event = new Event({
        ...req.body,
        organizer: req.user._id
      });

      await event.save();
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update event (organizer only)
router.patch('/:id',
  [auth, authorize('organizer', 'admin')],
  async (req, res) => {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = ['title', 'description', 'date', 'location', 'capacity', 'price', 'status', 'category'];
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
      }

      const event = await Event.findOne({
        _id: req.params.id,
        organizer: req.user._id
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      updates.forEach(update => event[update] = req.body[update]);
      await event.save();

      res.json(event);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Register for event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.attendees.some(attendee => attendee.user.equals(req.user._id))) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    event.attendees.push({ user: req.user._id });
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel registration
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user.equals(req.user._id)
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({ error: 'Not registered for this event' });
    }

    event.attendees.splice(attendeeIndex, 1);
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 