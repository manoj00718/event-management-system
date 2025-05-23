const nodemailer = require('nodemailer');
const User = require('../models/User');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// Configure nodemailer transporter
// In production, use a real email service like SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || 'your_mailtrap_username',
    pass: process.env.EMAIL_PASS || 'your_mailtrap_password'
  }
});

/**
 * Send an email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @returns {Promise<Object>} - Nodemailer send result
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'events@yourdomain.com',
      to,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Create an in-app notification
 * @param {string} userId - User ID
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} data - Additional data
 * @returns {Promise<Object>} - Created notification
 */
const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      data
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send event reminder to registered users
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} - Result with counts
 */
const sendEventReminders = async (eventId) => {
  try {
    const event = await Event.findById(eventId).populate('attendees.user');
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    const eventDate = new Date(event.date);
    const now = new Date();
    
    // Skip if event is in the past
    if (eventDate < now) {
      return { success: false, message: 'Event already occurred', emailsSent: 0, notificationsSent: 0 };
    }
    
    // Calculate hours until event
    const hoursUntilEvent = Math.round((eventDate - now) / (1000 * 60 * 60));
    
    let emailsSent = 0;
    let notificationsSent = 0;
    
    // Process each attendee
    for (const attendee of event.attendees) {
      const user = await User.findById(attendee.user);
      
      if (!user) continue;
      
      // Check if user has enabled reminders and if it's time to send a reminder
      if (user.preferences?.notifications?.eventReminders && 
          hoursUntilEvent <= user.preferences.notifications.reminderTime) {
        
        // Send email if enabled
        if (user.preferences.notifications.email) {
          const emailHtml = `
            <h2>Reminder: ${event.title}</h2>
            <p>Hello ${user.name},</p>
            <p>This is a friendly reminder that you're registered for <strong>${event.title}</strong>.</p>
            <p><strong>Date:</strong> ${eventDate.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${eventDate.toLocaleTimeString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p>We look forward to seeing you there!</p>
            <p>Best regards,<br>Event Management Team</p>
          `;
          
          await sendEmail(user.email, `Reminder: ${event.title}`, emailHtml);
          emailsSent++;
        }
        
        // Create in-app notification
        if (user.preferences.notifications.browser) {
          await createNotification(
            user._id,
            'event_reminder',
            `Reminder: ${event.title}`,
            `Your event is coming up on ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}`,
            { eventId: event._id }
          );
          notificationsSent++;
        }
      }
    }
    
    return { 
      success: true, 
      message: 'Reminders sent successfully', 
      emailsSent, 
      notificationsSent 
    };
  } catch (error) {
    console.error('Error sending event reminders:', error);
    throw error;
  }
};

/**
 * Send waitlist notification when a spot becomes available
 * @param {string} eventId - Event ID
 * @param {number} spotsAvailable - Number of spots available
 * @returns {Promise<Object>} - Result with counts
 */
const sendWaitlistNotifications = async (eventId, spotsAvailable = 1) => {
  try {
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    if (event.waitlist.length === 0) {
      return { success: true, message: 'No users on waitlist', emailsSent: 0, notificationsSent: 0 };
    }
    
    let emailsSent = 0;
    let notificationsSent = 0;
    
    // Notify users on the waitlist (up to the number of spots available)
    const usersToNotify = event.waitlist.slice(0, spotsAvailable);
    
    for (const waitlistEntry of usersToNotify) {
      const user = await User.findById(waitlistEntry.user);
      
      if (!user) continue;
      
      // Send email notification
      if (user.preferences?.notifications?.email) {
        const emailHtml = `
          <h2>Spot Available: ${event.title}</h2>
          <p>Hello ${user.name},</p>
          <p>Great news! A spot has become available for <strong>${event.title}</strong>, and you're next on the waitlist.</p>
          <p>Please log in to your account to confirm your registration within the next 24 hours.</p>
          <p>If you don't confirm within this time, the spot will be offered to the next person on the waitlist.</p>
          <p>Best regards,<br>Event Management Team</p>
        `;
        
        await sendEmail(user.email, `Spot Available: ${event.title}`, emailHtml);
        emailsSent++;
      }
      
      // Create in-app notification
      if (user.preferences?.notifications?.browser) {
        await createNotification(
          user._id,
          'waitlist_spot_available',
          `Spot Available: ${event.title}`,
          `A spot has opened up for an event you're waitlisted for. Please confirm your registration within 24 hours.`,
          { eventId: event._id }
        );
        notificationsSent++;
      }
    }
    
    return { 
      success: true, 
      message: 'Waitlist notifications sent successfully', 
      emailsSent, 
      notificationsSent 
    };
  } catch (error) {
    console.error('Error sending waitlist notifications:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  createNotification,
  sendEventReminders,
  sendWaitlistNotifications
}; 