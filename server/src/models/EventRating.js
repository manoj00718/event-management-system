const mongoose = require('mongoose');

const eventRatingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000
  },
  images: [{
    url: String,
    alt: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure user can only rate an event once
eventRatingSchema.index({ event: 1, user: 1 }, { unique: true });

// Update the updatedAt timestamp on save
eventRatingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get average rating for an event
eventRatingSchema.statics.getEventAverageRating = async function(eventId) {
  const result = await this.aggregate([
    { $match: { event: eventId } },
    {
      $group: {
        _id: '$event',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);
  return result[0] || { averageRating: 0, totalRatings: 0 };
};

const EventRating = mongoose.model('EventRating', eventRatingSchema);

module.exports = EventRating; 