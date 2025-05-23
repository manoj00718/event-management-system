const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'organizer', 'admin'],
    default: 'user'
  },
  profileImage: {
    url: {
      type: String,
      default: 'https://via.placeholder.com/150'
    },
    alt: {
      type: String,
      default: 'Profile Image'
    }
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    type: String,
    default: ''
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
  favoriteEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  preferences: {
    categories: [{
      type: String,
      enum: ['conference', 'workshop', 'seminar', 'networking', 'other']
    }],
    tags: [{
      type: String,
      trim: true
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      },
      eventReminders: {
        type: Boolean,
        default: true
      },
      reminderTime: {
        type: Number,
        default: 24
      }
    },
    displayMode: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    searchRadius: {
      type: Number,
      default: 50
    }
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    website: String
  },
  stats: {
    eventsAttended: {
      type: Number,
      default: 0
    },
    eventsOrganized: {
      type: Number,
      default: 0
    },
    totalRatingsGiven: {
      type: Number,
      default: 0
    }
  },
  paymentInfo: {
    stripeCustomerId: {
      type: String,
      default: null
    },
    paymentHistory: [{
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
      },
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
      },
      paymentId: String,
      paymentDate: {
        type: Date,
        default: Date.now
      }
    }]
  },
  qrCodes: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    code: String,
    issuedAt: {
      type: Date,
      default: Date.now
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

// Generate QR code for event registration
userSchema.methods.generateEventQR = async function(eventId) {
  // Implementation will be added in the QR code service
};

const User = mongoose.model('User', userSchema);

module.exports = User; 