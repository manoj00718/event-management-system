const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'event_reminder',
      'registration_confirmation',
      'event_update',
      'event_cancelled',
      'payment_success',
      'payment_failed',
      'waitlist_spot_available',
      'check_in_confirmation',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

// Mark notification as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

// Static method to create event reminder
notificationSchema.statics.createEventReminder = async function(user, event, timeUntilEvent) {
  return this.create({
    user: user._id,
    type: 'event_reminder',
    title: 'Event Reminder',
    message: `Your event "${event.title}" is starting in ${timeUntilEvent}`,
    data: {
      eventDate: event.date,
      eventLocation: event.location
    }
  });
};

// Static method to get unread notifications count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    user: userId,
    isRead: false
  });
};

// Static method to get recent notifications
notificationSchema.statics.getRecent = async function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 