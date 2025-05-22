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
  favoriteEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  preferences: {
    categories: [{
      type: String,
      enum: ['conference', 'workshop', 'seminar', 'networking', 'other']
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      }
    },
    displayMode: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
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

const User = mongoose.model('User', userSchema);

module.exports = User; 