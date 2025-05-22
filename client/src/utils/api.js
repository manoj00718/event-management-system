import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Profile API
export const getProfile = () => api.get('/profile/me');
export const updateProfile = (data) => api.patch('/profile/me', data);
export const addToFavorites = (eventId) => api.post(`/profile/favorites/${eventId}`);
export const removeFromFavorites = (eventId) => api.delete(`/profile/favorites/${eventId}`);
export const getFavorites = () => api.get('/profile/favorites');
export const updateNotificationPreferences = (prefs) => api.patch('/profile/preferences/notifications', prefs);
export const updateDisplayMode = (mode) => api.patch('/profile/preferences/display-mode', { mode });
export const getStats = () => api.get('/profile/stats');

// Event Engagement API
export const addEventRating = (eventId, data) => api.post(`/engagement/events/${eventId}/ratings`, data);
export const getEventRatings = (eventId, page = 1) => api.get(`/engagement/events/${eventId}/ratings?page=${page}`);
export const addComment = (eventId, data) => api.post(`/engagement/events/${eventId}/comments`, data);
export const getComments = (eventId, page = 1) => api.get(`/engagement/events/${eventId}/comments?page=${page}`);
export const getReplies = (commentId, page = 1) => api.get(`/engagement/comments/${commentId}/replies?page=${page}`);
export const toggleCommentLike = (commentId) => api.post(`/engagement/comments/${commentId}/like`);

// Analytics API
export const getEventAnalytics = (eventId) => api.get(`/analytics/events/${eventId}`);
export const trackEventView = (eventId, isUnique) => api.post(`/analytics/events/${eventId}/views`, { isUnique });
export const updateRegistrationAnalytics = (eventId, type) => api.post(`/analytics/events/${eventId}/registrations`, { type });
export const updateRevenueAnalytics = (eventId, data) => api.post(`/analytics/events/${eventId}/revenue`, data);
export const getEventInsights = (eventId) => api.get(`/analytics/events/${eventId}/insights`);
export const getOrganizerDashboard = () => api.get('/analytics/dashboard');

// Notifications API
export const getNotifications = (page = 1) => api.get(`/notifications?page=${page}`);
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.post('/notifications/mark-all-read');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const updateNotificationDelivery = (prefs) => api.patch('/notifications/preferences', prefs);

export default api; 