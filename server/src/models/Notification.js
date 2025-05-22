const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'event_reminder',
      'event_update',
      'event_cancelled',
      'new_comment',
      'comment_reply',
      'registration_confirmed',
      'event_starting_soon',
      'new_rating'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  link: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  deliveryMethod: {
    email: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // Automatically delete after 30 days
  }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

// Mark notification as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  await this.save();
};

// Static method to create event reminder
notificationSchema.statics.createEventReminder = async function(user, event, timeUntilEvent) {
  return this.create({
    recipient: user._id,
    type: 'event_reminder',
    title: 'Event Reminder',
    message: `Your event "${event.title}" is starting in ${timeUntilEvent}`,
    event: event._id,
    link: `/events/${event._id}`,
    priority: 'high',
    metadata: {
      eventDate: event.date,
      eventLocation: event.location
    }
  });
};

// Static method to get unread notifications count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    recipient: userId,
    read: false
  });
};

// Static method to get recent notifications
notificationSchema.statics.getRecent = async function(userId, limit = 10) {
  return this.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('event', 'title date')
    .lean();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 