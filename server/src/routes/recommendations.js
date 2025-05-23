const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getRecommendedEvents, getSimilarEvents } = require('../utils/recommendationService');

/**
 * @route   GET /api/recommendations
 * @desc    Get recommended events for the current user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, includeAttended, prioritizeLocation } = req.query;
    
    const options = {
      limit: parseInt(limit),
      includeAttended: includeAttended === 'true',
      prioritizeLocation: prioritizeLocation !== 'false'
    };
    
    const recommendedEvents = await getRecommendedEvents(userId, options);
    
    res.status(200).json({
      success: true,
      count: recommendedEvents.length,
      events: recommendedEvents
    });
  } catch (error) {
    console.error('Error getting recommended events:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting recommended events'
    });
  }
});

/**
 * @route   GET /api/recommendations/similar/:eventId
 * @desc    Get similar events to a specific event
 * @access  Public
 */
router.get('/similar/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { limit = 5 } = req.query;
    
    const similarEvents = await getSimilarEvents(eventId, parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: similarEvents.length,
      events: similarEvents
    });
  } catch (error) {
    console.error('Error getting similar events:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting similar events'
    });
  }
});

module.exports = router; 