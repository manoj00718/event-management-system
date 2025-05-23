const cron = require('node-cron');
const Event = require('../models/Event');
const { sendEventReminders } = require('./notificationService');

/**
 * Initialize all scheduler jobs
 */
const initScheduler = () => {
  // Schedule event reminders check every hour
  scheduleEventReminders();
  
  console.log('Scheduler service initialized');
};

/**
 * Schedule event reminders check
 */
const scheduleEventReminders = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running event reminders check...');
      
      const now = new Date();
      // Find upcoming events in the next 48 hours
      const upcomingEvents = await Event.find({
        date: {
          $gt: now,
          $lt: new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours ahead
        },
        status: 'upcoming'
      });
      
      console.log(`Found ${upcomingEvents.length} upcoming events in the next 48 hours`);
      
      // Process each event
      for (const event of upcomingEvents) {
        try {
          const result = await sendEventReminders(event._id);
          console.log(`Reminders for event ${event.title}:`, result);
        } catch (error) {
          console.error(`Error processing reminders for event ${event._id}:`, error);
        }
      }
      
      console.log('Event reminders check completed');
    } catch (error) {
      console.error('Error in event reminders scheduler:', error);
    }
  });
  
  console.log('Event reminders scheduler initialized');
};

/**
 * Schedule a one-time reminder for a specific event
 * @param {string} eventId - Event ID
 * @param {Date} reminderTime - When to send the reminder
 * @returns {Object} - The scheduled job
 */
const scheduleOneTimeReminder = (eventId, reminderTime) => {
  const now = new Date();
  const scheduledTime = new Date(reminderTime);
  
  // If reminder time is in the past, don't schedule
  if (scheduledTime <= now) {
    console.log(`Reminder time for event ${eventId} is in the past, skipping`);
    return null;
  }
  
  // Calculate cron expression for the specific time
  const minutes = scheduledTime.getMinutes();
  const hours = scheduledTime.getHours();
  const dayOfMonth = scheduledTime.getDate();
  const month = scheduledTime.getMonth() + 1; // 0-based to 1-based
  
  // Create cron expression for one-time execution
  const cronExpression = `${minutes} ${hours} ${dayOfMonth} ${month} *`;
  
  // Schedule the job
  const job = cron.schedule(cronExpression, async () => {
    try {
      console.log(`Running one-time reminder for event ${eventId}`);
      const result = await sendEventReminders(eventId);
      console.log(`One-time reminder result:`, result);
      
      // Stop the job after execution
      job.stop();
    } catch (error) {
      console.error(`Error in one-time reminder for event ${eventId}:`, error);
    }
  });
  
  console.log(`One-time reminder scheduled for event ${eventId} at ${scheduledTime}`);
  return job;
};

module.exports = {
  initScheduler,
  scheduleEventReminders,
  scheduleOneTimeReminder
}; 