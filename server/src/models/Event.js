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
  coordinates: {
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    }
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
  isPaid: {
    type: Boolean,
    default: false
  },
  stripeProductId: {
    type: String,
    default: null
  },
  stripePriceId: {
    type: String,
    default: null
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
    },
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkedInAt: {
      type: Date,
      default: null
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'not_applicable'],
      default: 'not_applicable'
    },
    paymentId: {
      type: String,
      default: null
    }
  }],
  waitlist: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
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
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    registrationRate: {
      type: Number,
      default: 0
    },
    checkInRate: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.attendees.length;
});

eventSchema.virtual('waitlistSize').get(function() {
  return this.waitlist.length;
});

eventSchema.virtual('checkInRate').get(function() {
  if (this.attendees.length === 0) return 0;
  const checkedInCount = this.attendees.filter(a => a.checkedIn).length;
  return (checkedInCount / this.attendees.length) * 100;
});

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