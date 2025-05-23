const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');
const { sendWaitlistNotifications } = require('../utils/notificationService');
const { createEventProduct } = require('../utils/paymentService');
const { upload, deleteImage, getImageUrl } = require('../utils/fileUploadService');

const router = express.Router();

// Get all events with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      status, 
      search, 
      page = 1, 
      limit = 10,
      isPaid,
      minPrice,
      maxPrice,
      tags,
      location
    } = req.query;
    
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (isPaid !== undefined) query.isPaid = isPaid === 'true';
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
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
      currentPage: parseInt(page),
      totalEvents: total
    });
  } catch (error) {
    console.error('Error getting events:', error);
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
    
    // Increment view count
    event.analytics.views += 1;
    await event.save();

    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create event (organizer only)
router.post('/',
  [auth, authorize('organizer', 'admin')],
  upload.single('image'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
    body('isPaid').isBoolean().optional().withMessage('isPaid must be a boolean'),
    body('category').isIn(['conference', 'workshop', 'seminar', 'networking', 'other'])
      .withMessage('Invalid category')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // If there's an uploaded file but validation failed, delete it
        if (req.file) {
          deleteImage(req.file.filename);
        }
        return res.status(400).json({ errors: errors.array() });
      }

      // Parse JSON fields if they were sent as strings
      if (req.body.tags && typeof req.body.tags === 'string') {
        try {
          req.body.tags = JSON.parse(req.body.tags);
        } catch (e) {
          req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
        }
      }

      if (req.body.socialSharing && typeof req.body.socialSharing === 'string') {
        try {
          req.body.socialSharing = JSON.parse(req.body.socialSharing);
        } catch (e) {
          // Keep as is if parsing fails
        }
      }

      const eventData = {
        ...req.body,
        organizer: req.user.id
      };
      
      // Handle coordinates if provided
      if (req.body.coordinates) {
        if (typeof req.body.coordinates === 'string') {
          try {
            eventData.coordinates = JSON.parse(req.body.coordinates);
          } catch (e) {
            // If parsing fails, try to extract lat/lng from string format
            console.error('Error parsing coordinates:', e);
          }
        } else {
          eventData.coordinates = {
            lat: parseFloat(req.body.coordinates.lat),
            lng: parseFloat(req.body.coordinates.lng)
          };
        }
      }

      // Handle image upload
      if (req.file) {
        eventData.image = {
          url: getImageUrl(req, req.file.filename),
          alt: req.body.imageAlt || 'Event image',
          filename: req.file.filename,
          originalname: req.file.originalname
        };
      }
      
      const event = new Event(eventData);
      await event.save();
      
      // If it's a paid event with price > 0, create Stripe product
      if (event.isPaid && event.price > 0) {
        try {
          await createEventProduct(event);
        } catch (error) {
          console.error('Error creating Stripe product:', error);
          // Continue even if Stripe product creation fails
        }
      }

      res.status(201).json(event);
    } catch (error) {
      // If there's an uploaded file but saving failed, delete it
      if (req.file) {
        deleteImage(req.file.filename);
      }
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update event (organizer only)
router.patch('/:id',
  [auth, authorize('organizer', 'admin')],
  upload.single('image'),
  async (req, res) => {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = [
        'title', 'description', 'date', 'location', 'coordinates',
        'capacity', 'price', 'isPaid', 'status', 'category', 'tags', 'image',
        'imageAlt', 'socialSharing'
      ];
      
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        // If there's an uploaded file but validation failed, delete it
        if (req.file) {
          deleteImage(req.file.filename);
        }
        return res.status(400).json({ error: 'Invalid updates' });
      }

      // Find the event - allow admins to edit any event
      let event;
      if (req.user.role === 'admin') {
        event = await Event.findById(req.params.id);
      } else {
        event = await Event.findOne({
          _id: req.params.id,
          organizer: req.user.id
        });
      }

      if (!event) {
        // If there's an uploaded file but event not found, delete it
        if (req.file) {
          deleteImage(req.file.filename);
        }
        return res.status(404).json({ error: 'Event not found' });
      }

      // Parse JSON fields if they were sent as strings
      if (req.body.tags && typeof req.body.tags === 'string') {
        try {
          req.body.tags = JSON.parse(req.body.tags);
        } catch (e) {
          req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
        }
      }

      if (req.body.socialSharing && typeof req.body.socialSharing === 'string') {
        try {
          req.body.socialSharing = JSON.parse(req.body.socialSharing);
        } catch (e) {
          // Keep as is if parsing fails
          console.error('Error parsing socialSharing:', e);
        }
      }
      
      // Special handling for coordinates
      if (req.body.coordinates) {
        if (typeof req.body.coordinates === 'string') {
          try {
            event.coordinates = JSON.parse(req.body.coordinates);
          } catch (e) {
            // If parsing fails, try to extract lat/lng from string format
            console.error('Error parsing coordinates:', e);
          }
        } else {
          event.coordinates = {
            lat: parseFloat(req.body.coordinates.lat),
            lng: parseFloat(req.body.coordinates.lng)
          };
        }
        delete req.body.coordinates;
      }

      // Handle image upload
      if (req.file) {
        // Delete old image if it exists
        if (event.image && event.image.filename) {
          deleteImage(event.image.filename);
        }

        event.image = {
          url: getImageUrl(req, req.file.filename),
          alt: req.body.imageAlt || event.image.alt || 'Event image',
          filename: req.file.filename,
          originalname: req.file.originalname
        };
      } else if (req.body.imageAlt) {
        // Update only the alt text if provided
        if (event.image) {
          event.image.alt = req.body.imageAlt;
        } else {
          event.image = {
            url: 'https://via.placeholder.com/800x400',
            alt: req.body.imageAlt,
            filename: null,
            originalname: null
          };
        }
      }

      // Update other fields
      updates.forEach(update => {
        if (!['coordinates', 'image', 'imageAlt'].includes(update)) {
          event[update] = req.body[update];
        }
      });
      
      await event.save();
      
      // If it's a paid event with price > 0, update Stripe product
      if (event.isPaid && event.price > 0 && 
          (updates.includes('price') || updates.includes('isPaid') || updates.includes('title'))) {
        try {
          await createEventProduct(event);
        } catch (error) {
          console.error('Error updating Stripe product:', error);
          // Continue even if Stripe product update fails
        }
      }

      res.json(event);
    } catch (error) {
      // If there's an uploaded file but saving failed, delete it
      if (req.file) {
        deleteImage(req.file.filename);
      }
      console.error('Error updating event:', error);
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

    if (event.attendees.some(attendee => attendee.user.toString() === req.user.id)) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ 
        error: 'Event is full',
        canJoinWaitlist: true
      });
    }
    
    // If it's a paid event, don't register yet, just return payment info
    if (event.isPaid && event.price > 0) {
      return res.status(200).json({
        requiresPayment: true,
        event: {
          _id: event._id,
          title: event.title,
          price: event.price
        }
      });
    }

    // For free events, register immediately
    event.attendees.push({ 
      user: req.user.id,
      registeredAt: new Date(),
      paymentStatus: 'not_applicable'
    });
    
    // Update analytics
    event.analytics.registrationRate = (event.attendees.length / event.capacity) * 100;
    
    await event.save();

    res.json({
      success: true,
      message: 'Registration successful',
      event: {
        _id: event._id,
        title: event.title,
        date: event.date
      }
    });
  } catch (error) {
    console.error('Error registering for event:', error);
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
      attendee => attendee.user.toString() === req.user.id
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({ error: 'Not registered for this event' });
    }
    
    // Check if there's a waitlist and notify next person
    const hasWaitlist = event.waitlist && event.waitlist.length > 0;
    
    // Remove from attendees
    event.attendees.splice(attendeeIndex, 1);
    
    // Update analytics
    event.analytics.registrationRate = (event.attendees.length / event.capacity) * 100;
    
    await event.save();
    
    // If there's a waitlist, notify the next person
    if (hasWaitlist) {
      try {
        await sendWaitlistNotifications(event._id, 1);
      } catch (error) {
        console.error('Error sending waitlist notification:', error);
        // Continue even if notification fails
      }
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check in attendee (organizer only)
router.post('/:id/check-in/:userId', [auth, authorize('organizer', 'admin')], async (req, res) => {
  try {
    const { id: eventId, userId } = req.params;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is the organizer or admin
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to check in attendees for this event' });
    }
    
    // Find attendee
    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user.toString() === userId
    );
    
    if (attendeeIndex === -1) {
      return res.status(400).json({ error: 'User not registered for this event' });
    }
    
    // Update check-in status
    event.attendees[attendeeIndex].checkedIn = true;
    event.attendees[attendeeIndex].checkedInAt = new Date();
    
    // Update analytics
    event.analytics.checkInRate = (event.attendees.filter(a => a.checkedIn).length / event.attendees.length) * 100;
    
    await event.save();
    
    res.json({
      success: true,
      message: 'Attendee checked in successfully',
      attendee: {
        user: event.attendees[attendeeIndex].user,
        checkedIn: true,
        checkedInAt: event.attendees[attendeeIndex].checkedInAt
      }
    });
  } catch (error) {
    console.error('Error checking in attendee:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete event (organizer only)
router.delete('/:id', [auth, authorize('organizer', 'admin')], async (req, res) => {
  try {
    // Find the event - allow admins to delete any event
    let event;
    if (req.user.role === 'admin') {
      event = await Event.findById(req.params.id);
    } else {
      event = await Event.findOne({
        _id: req.params.id,
        organizer: req.user.id
      });
    }
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Delete the event image file if it exists
    if (event.image && event.image.filename) {
      deleteImage(event.image.filename);
    }
    
    // Use findByIdAndDelete instead of remove()
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 