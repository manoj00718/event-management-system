const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'link'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    title: String
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

// Update timestamps on save
commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.isModified('content')) {
    this.isEdited = true;
  }
  next();
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return Comment.countDocuments({ parentComment: this._id });
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment; 