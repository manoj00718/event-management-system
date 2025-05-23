const User = require('../models/User');
const Event = require('../models/Event');

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} coord1 - First coordinate {lat, lng}
 * @param {Object} coord2 - Second coordinate {lat, lng}
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2 || !coord1.lat || !coord1.lng || !coord2.lat || !coord2.lng) {
    return Infinity;
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Calculate category match score between user and event
 * @param {Object} user - User object
 * @param {Object} event - Event object
 * @returns {number} - Category match score (0-1)
 */
const calculateCategoryMatch = (user, event) => {
  if (!user.preferences || !user.preferences.categories || user.preferences.categories.length === 0) {
    return 0.5; // Neutral score if user has no preferences
  }
  
  return user.preferences.categories.includes(event.category) ? 1 : 0;
};

/**
 * Calculate tags match score between user and event
 * @param {Object} user - User object
 * @param {Object} event - Event object
 * @returns {number} - Tags match score (0-1)
 */
const calculateTagsMatch = (user, event) => {
  if (!user.preferences || !user.preferences.tags || user.preferences.tags.length === 0 || 
      !event.tags || event.tags.length === 0) {
    return 0.5; // Neutral score if either has no tags
  }
  
  const userTags = user.preferences.tags.map(tag => tag.toLowerCase());
  const eventTags = event.tags.map(tag => tag.toLowerCase());
  
  // Count matching tags
  const matchingTags = userTags.filter(tag => eventTags.includes(tag)).length;
  
  // Calculate score based on percentage of user's tags that match
  return matchingTags / userTags.length;
};

/**
 * Get recommended events for a user
 * @param {string} userId - User ID
 * @param {Object} options - Options for recommendations
 * @param {number} options.limit - Maximum number of recommendations
 * @param {boolean} options.includeAttended - Whether to include event types user has attended
 * @param {boolean} options.prioritizeLocation - Whether to prioritize nearby events
 * @returns {Promise<Array>} - Array of recommended events
 */
const getRecommendedEvents = async (userId, options = {}) => {
  try {
    const {
      limit = 10,
      includeAttended = true,
      prioritizeLocation = true
    } = options;
    
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get all upcoming events
    const now = new Date();
    const upcomingEvents = await Event.find({
      date: { $gt: now },
      status: 'upcoming'
    }).populate('organizer', 'name');
    
    // Get events user is already registered for
    const registeredEventIds = upcomingEvents
      .filter(event => event.attendees.some(attendee => attendee.user.toString() === userId))
      .map(event => event._id.toString());
    
    // Filter out events user is already registered for
    const availableEvents = upcomingEvents.filter(event => 
      !registeredEventIds.includes(event._id.toString())
    );
    
    if (availableEvents.length === 0) {
      return [];
    }
    
    // Calculate scores for each event
    const scoredEvents = availableEvents.map(event => {
      // Base score starts at 0.5
      let score = 0.5;
      
      // Category match (0-1)
      const categoryScore = calculateCategoryMatch(user, event);
      score += categoryScore * 0.3; // 30% weight
      
      // Tags match (0-1)
      const tagsScore = calculateTagsMatch(user, event);
      score += tagsScore * 0.2; // 20% weight
      
      // Location proximity (0-1)
      let distanceScore = 0.5;
      if (prioritizeLocation && user.coordinates && event.coordinates) {
        const distance = calculateDistance(user.coordinates, event.coordinates);
        const maxDistance = user.preferences?.searchRadius || 50;
        distanceScore = Math.max(0, 1 - (distance / maxDistance));
        score += distanceScore * 0.3; // 30% weight
      }
      
      // Popularity score based on attendees (0-1)
      const popularityScore = Math.min(1, event.attendees.length / event.capacity);
      score += popularityScore * 0.2; // 20% weight
      
      return {
        event,
        score,
        metrics: {
          categoryScore,
          tagsScore,
          distanceScore,
          popularityScore
        }
      };
    });
    
    // Sort by score (highest first) and take the top 'limit'
    const recommendations = scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        ...item.event.toObject(),
        recommendationScore: item.score,
        recommendationMetrics: item.metrics
      }));
    
    return recommendations;
  } catch (error) {
    console.error('Error getting recommended events:', error);
    throw error;
  }
};

/**
 * Get similar events to a specified event
 * @param {string} eventId - Event ID
 * @param {number} limit - Maximum number of similar events
 * @returns {Promise<Array>} - Array of similar events
 */
const getSimilarEvents = async (eventId, limit = 5) => {
  try {
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Get all upcoming events except the current one
    const now = new Date();
    const upcomingEvents = await Event.find({
      _id: { $ne: eventId },
      date: { $gt: now },
      status: 'upcoming'
    }).populate('organizer', 'name');
    
    if (upcomingEvents.length === 0) {
      return [];
    }
    
    // Calculate similarity scores
    const scoredEvents = upcomingEvents.map(otherEvent => {
      let score = 0;
      
      // Same category
      if (otherEvent.category === event.category) {
        score += 0.4;
      }
      
      // Tags overlap
      if (event.tags && event.tags.length > 0 && otherEvent.tags && otherEvent.tags.length > 0) {
        const eventTags = event.tags.map(tag => tag.toLowerCase());
        const otherEventTags = otherEvent.tags.map(tag => tag.toLowerCase());
        
        const commonTags = eventTags.filter(tag => otherEventTags.includes(tag)).length;
        const tagScore = commonTags / Math.max(1, Math.min(eventTags.length, otherEventTags.length));
        score += tagScore * 0.3;
      }
      
      // Same organizer
      if (otherEvent.organizer.toString() === event.organizer.toString()) {
        score += 0.2;
      }
      
      // Location proximity
      if (event.coordinates && otherEvent.coordinates) {
        const distance = calculateDistance(event.coordinates, otherEvent.coordinates);
        const proximityScore = Math.max(0, 1 - (distance / 50)); // Within 50km
        score += proximityScore * 0.1;
      }
      
      return {
        event: otherEvent,
        score
      };
    });
    
    // Sort by score and take top 'limit'
    const similarEvents = scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        ...item.event.toObject(),
        similarityScore: item.score
      }));
    
    return similarEvents;
  } catch (error) {
    console.error('Error getting similar events:', error);
    throw error;
  }
};

module.exports = {
  getRecommendedEvents,
  getSimilarEvents,
  calculateDistance
}; 