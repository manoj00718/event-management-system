const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Event = require('../models/Event');
const EventRating = require('../models/EventRating');
const Comment = require('../models/Comment');
const { body, validationResult } = require('express-validator');

// Add a rating to an event
router.post('/events/:eventId/ratings', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 1000 }).withMessage('Review cannot exceed 1000 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const existingRating = await EventRating.findOne({
      event: req.params.eventId,
      user: req.user.id
    });

    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this event' });
    }

    const rating = new EventRating({
      event: req.params.eventId,
      user: req.user.id,
      rating: req.body.rating,
      review: req.body.review,
      images: req.body.images || []
    });

    await rating.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    user.stats.totalRatingsGiven += 1;
    await user.save();

    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get event ratings
router.get('/events/:eventId/ratings', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const ratings = await EventRating.find({ event: req.params.eventId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await EventRating.countDocuments({ event: req.params.eventId });
    const averageRating = await EventRating.getEventAverageRating(req.params.eventId);

    res.json({
      ratings,
      total,
      averageRating: averageRating.averageRating,
      totalRatings: averageRating.totalRatings,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a comment to an event
router.post('/events/:eventId/comments', auth, [
  body('content').trim().notEmpty().withMessage('Comment content is required')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  body('parentComment').optional().isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const comment = new Comment({
      event: req.params.eventId,
      user: req.user.id,
      content: req.body.content,
      parentComment: req.body.parentComment || null,
      attachments: req.body.attachments || []
    });

    await comment.save();

    // If this is a reply, create a notification for the parent comment's author
    if (req.body.parentComment) {
      const parentComment = await Comment.findById(req.body.parentComment);
      if (parentComment && parentComment.user.toString() !== req.user.id) {
        await Notification.create({
          recipient: parentComment.user,
          type: 'comment_reply',
          title: 'New Reply to Your Comment',
          message: `${req.user.name} replied to your comment on "${event.title}"`,
          event: event._id,
          link: `/events/${event._id}#comment-${comment._id}`
        });
      }
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name profileImage');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get event comments
router.get('/events/:eventId/comments', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      event: req.params.eventId,
      parentComment: null // Get only top-level comments
    })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get reply counts for each comment
    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const replyCount = await Comment.countDocuments({
        parentComment: comment._id
      });
      return {
        ...comment.toObject(),
        replyCount
      };
    }));

    const total = await Comment.countDocuments({
      event: req.params.eventId,
      parentComment: null
    });

    res.json({
      comments: commentsWithReplies,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get comment replies
router.get('/comments/:commentId/replies', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const replies = await Comment.find({
      parentComment: req.params.commentId
    })
      .populate('user', 'name profileImage')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      parentComment: req.params.commentId
    });

    res.json({
      replies,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/unlike a comment
router.post('/comments/:commentId/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(req.user.id);
    if (likeIndex === -1) {
      comment.likes.push(req.user.id);
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    await comment.save();
    res.json({ likes: comment.likes.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 