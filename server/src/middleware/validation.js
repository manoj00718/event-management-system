const { AppError } = require('./errorHandler');

const validateEvent = (req, res, next) => {
  const { title, description, date, location, capacity, price, category } = req.body;

  if (!title || title.trim() === '') {
    return next(new AppError('Event title is required', 400));
  }

  if (!description || description.trim() === '') {
    return next(new AppError('Event description is required', 400));
  }

  if (!date) {
    return next(new AppError('Event date is required', 400));
  }

  const eventDate = new Date(date);
  if (isNaN(eventDate.getTime())) {
    return next(new AppError('Invalid date format', 400));
  }

  if (eventDate < new Date()) {
    return next(new AppError('Event date must be in the future', 400));
  }

  if (!location || location.trim() === '') {
    return next(new AppError('Event location is required', 400));
  }

  if (!capacity || isNaN(capacity) || parseInt(capacity) <= 0) {
    return next(new AppError('Event capacity must be a positive number', 400));
  }

  if (!price || isNaN(price) || parseFloat(price) < 0) {
    return next(new AppError('Event price must be a non-negative number', 400));
  }

  if (!category || !['conference', 'workshop', 'seminar', 'networking', 'other'].includes(category.toLowerCase())) {
    return next(new AppError('Invalid event category', 400));
  }

  next();
};

const validateRegistration = (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError('User ID is required for registration', 400));
  }

  next();
};

const validateUser = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || name.trim() === '') {
    return next(new AppError('Name is required', 400));
  }

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return next(new AppError('Valid email is required', 400));
  }

  if (!password || password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }

  if (role && !['user', 'organizer', 'admin'].includes(role)) {
    return next(new AppError('Invalid user role', 400));
  }

  next();
};

module.exports = {
  validateEvent,
  validateRegistration,
  validateUser
}; 