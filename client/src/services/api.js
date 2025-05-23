import axios from 'axios';
import { toast } from 'react-toastify';
import { handleApiError } from '../utils/errorHandler';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor to attach the token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If we're sending FormData, let the browser set the content-type (needed for multipart/form-data)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Use our centralized error handler
    handleApiError(error, {
      onNetworkError: () => {
        // Don't show network error for health check endpoints
        if (error.config && error.config.url && error.config.url.includes('/health')) {
          return;
        }
      }
    });
    
    return Promise.reject(error);
  }
);

// Mock response function for development when server is unavailable
const mockResponse = (data, delay = 500) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ data, status: 200, statusText: 'OK', headers: {} });
    }, delay);
  });
};

// API service methods
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    me: () => api.get('/auth/me'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
  },
  
  // Events endpoints
  events: {
    getAll: async (params) => {
      try {
        return await api.get('/events', { params });
      } catch (error) {
        console.log('Using mock data for events');
        // Simple mock data if server is unavailable
        return mockResponse({
          events: Array(8).fill().map((_, i) => ({
            _id: `mock-event-${i}`,
            title: `Mock Event ${i + 1}`,
            description: 'This is a mock event when the server is unavailable',
            date: new Date(Date.now() + i * 86400000).toISOString(),
            location: 'Virtual Event',
            capacity: 100,
            price: 99.99,
            image: {
              url: `https://source.unsplash.com/random/300x200?event&sig=${i}`,
              alt: 'Event image'
            },
            category: ['conference', 'workshop', 'seminar', 'networking', 'other'][i % 5],
            status: ['upcoming', 'ongoing', 'completed'][i % 3],
          }))
        });
      }
    },
    getById: async (id) => {
      try {
        return await api.get(`/events/${id}`);
      } catch (error) {
        // If event not found or server error, return mock data
        return mockResponse({
          _id: id,
          title: 'Mock Event Details',
          description: 'This is a detailed mock event description when the server is unavailable.',
          date: new Date(Date.now() + 7 * 86400000).toISOString(),
          location: 'Virtual Location',
          capacity: 100,
          price: 99.99,
          category: 'conference',
          status: 'upcoming',
          image: {
            url: 'https://source.unsplash.com/random/800x600?event',
            alt: 'Event image'
          },
          organizer: {
            _id: 'mock-organizer',
            name: 'Mock Organizer'
          },
          attendees: [],
          tags: ['technology', 'conference', 'virtual'],
          socialSharing: {
            enabled: true,
            platforms: ['facebook', 'twitter', 'linkedin'],
            customMessage: 'Join this amazing event!'
          }
        });
      }
    },
    create: (eventData) => api.post('/events', eventData),
    update: (id, eventData) => api.patch(`/events/${id}`, eventData),
    delete: (id) => api.delete(`/events/${id}`),
    attend: (id) => api.post(`/events/${id}/attend`),
    cancelAttendance: (id) => api.delete(`/events/${id}/attend`),
    getAttendees: (id) => api.get(`/events/${id}/attendees`),
    getFeatured: () => api.get('/events/featured'),
    getUpcoming: () => api.get('/events/upcoming'),
    search: (query) => api.get(`/events/search?q=${query}`),
  },
  
  // User profile endpoints
  profile: {
    getMyEvents: () => api.get('/profile/events'),
    getAttendingEvents: () => api.get('/profile/attending'),
    toggleFavorite: (eventId) => api.post(`/profile/favorites/${eventId}`),
    getFavorites: () => api.get('/profile/favorites'),
  },
  
  // Engagement endpoints (ratings, comments)
  engagement: {
    rateEvent: (eventId, rating, comment) => 
      api.post(`/engagement/rate/${eventId}`, { rating, comment }),
    getEventRatings: (eventId) => 
      api.get(`/engagement/ratings/${eventId}`),
    addComment: (eventId, comment) => 
      api.post(`/engagement/comment/${eventId}`, { comment }),
    getEventComments: (eventId) => 
      api.get(`/engagement/comments/${eventId}`),
    deleteComment: (commentId) => 
      api.delete(`/engagement/comment/${commentId}`),
  },
  
  // Notifications endpoints
  notifications: {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
  },
  
  // System health check
  system: {
    health: () => api.get('/health'),
  },
  
  // General utility for custom requests
  custom: {
    get: (endpoint, config) => api.get(endpoint, config),
    post: (endpoint, data, config) => api.post(endpoint, data, config),
    put: (endpoint, data, config) => api.put(endpoint, data, config),
    delete: (endpoint, config) => api.delete(endpoint, config),
  },
};

export default apiService; 