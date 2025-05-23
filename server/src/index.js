require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const { initScheduler } = require('./utils/schedulerService');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const profileRoutes = require('./routes/profile');
const engagementRoutes = require('./routes/engagement');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');

// Import new routes
const paymentRoutes = require('./routes/payments');
const qrCodeRoutes = require('./routes/qrCodes');
const recommendationRoutes = require('./routes/recommendations');
const waitlistRoutes = require('./routes/waitlist');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// New routes
app.use('/api/payments', paymentRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/waitlist', waitlistRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Initialize scheduler for event reminders
    initScheduler();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 