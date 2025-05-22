const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  category: {
    type: String,
    required: true,
    enum: ['conference', 'workshop', 'seminar', 'networking', 'other']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  image: {
    url: {
      type: String,
      default: 'https://via.placeholder.com/800x400'
    },
    alt: {
      type: String,
      default: 'Event image'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  socialSharing: {
    enabled: {
      type: Boolean,
      default: true
    },
    platforms: [{
      type: String,
      enum: ['facebook', 'twitter', 'linkedin', 'whatsapp'],
      default: ['facebook', 'twitter', 'linkedin']
    }],
    customMessage: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.attendees.length;
});

// Generate slug before saving
eventSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .concat('-', Date.now().toString().slice(-4));
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 