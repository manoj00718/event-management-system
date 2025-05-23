const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'your_stripe_test_key');
const User = require('../models/User');
const Event = require('../models/Event');

/**
 * Create a Stripe customer for a user
 * @param {Object} user - User object
 * @returns {Promise<string>} - Stripe customer ID
 */
const createCustomer = async (user) => {
  try {
    // Check if user already has a Stripe customer ID
    if (user.paymentInfo && user.paymentInfo.stripeCustomerId) {
      return user.paymentInfo.stripeCustomerId;
    }
    
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString()
      }
    });
    
    // Update user with Stripe customer ID
    if (!user.paymentInfo) {
      user.paymentInfo = { stripeCustomerId: customer.id };
    } else {
      user.paymentInfo.stripeCustomerId = customer.id;
    }
    
    await user.save();
    
    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

/**
 * Create a Stripe product and price for an event
 * @param {Object} event - Event object
 * @returns {Promise<Object>} - Stripe product and price IDs
 */
const createEventProduct = async (event) => {
  try {
    // Check if event already has Stripe product ID
    if (event.stripeProductId && event.stripePriceId) {
      return {
        productId: event.stripeProductId,
        priceId: event.stripePriceId
      };
    }
    
    // Create a new product in Stripe
    const product = await stripe.products.create({
      name: event.title,
      description: event.description,
      metadata: {
        eventId: event._id.toString()
      }
    });
    
    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(event.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        eventId: event._id.toString()
      }
    });
    
    // Update event with Stripe IDs
    event.stripeProductId = product.id;
    event.stripePriceId = price.id;
    await event.save();
    
    return {
      productId: product.id,
      priceId: price.id
    };
  } catch (error) {
    console.error('Error creating Stripe product:', error);
    throw error;
  }
};

/**
 * Create a payment intent for event registration
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} - Payment intent client secret
 */
const createPaymentIntent = async (userId, eventId) => {
  try {
    const user = await User.findById(userId);
    const event = await Event.findById(eventId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    // Check if event is paid
    if (!event.isPaid || event.price <= 0) {
      throw new Error('This is not a paid event');
    }
    
    // Create or get Stripe customer
    const customerId = await createCustomer(user);
    
    // Create or get Stripe product and price
    const { priceId } = await createEventProduct(event);
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(event.price * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        eventId: event._id.toString(),
        userId: user._id.toString()
      },
      receipt_email: user.email,
      description: `Registration for ${event.title}`
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Process successful payment for event registration
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} - Result with registration status
 */
const processSuccessfulPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
    }
    
    const { eventId, userId } = paymentIntent.metadata;
    
    // Find user and event
    const user = await User.findById(userId);
    const event = await Event.findById(eventId);
    
    if (!user || !event) {
      throw new Error('User or event not found');
    }
    
    // Check if user is already registered
    const isRegistered = event.attendees.some(attendee => 
      attendee.user.toString() === userId
    );
    
    if (isRegistered) {
      // Update payment status if already registered
      const attendeeIndex = event.attendees.findIndex(attendee => 
        attendee.user.toString() === userId
      );
      
      event.attendees[attendeeIndex].paymentStatus = 'completed';
      event.attendees[attendeeIndex].paymentId = paymentIntentId;
      
      await event.save();
      
      return { success: true, message: 'Payment processed successfully', alreadyRegistered: true };
    }
    
    // Register user for the event
    event.attendees.push({
      user: userId,
      registeredAt: new Date(),
      paymentStatus: 'completed',
      paymentId: paymentIntentId
    });
    
    // Add payment record to user
    if (!user.paymentInfo) {
      user.paymentInfo = { 
        stripeCustomerId: paymentIntent.customer,
        paymentHistory: []
      };
    }
    
    user.paymentInfo.paymentHistory.push({
      eventId,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      status: 'completed',
      paymentId: paymentIntentId,
      paymentDate: new Date()
    });
    
    // Save changes
    await Promise.all([event.save(), user.save()]);
    
    return { success: true, message: 'Payment processed and registration completed' };
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

/**
 * Process refund for event registration
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} - Refund result
 */
const processRefund = async (userId, eventId) => {
  try {
    const user = await User.findById(userId);
    const event = await Event.findById(eventId);
    
    if (!user || !event) {
      throw new Error('User or event not found');
    }
    
    // Find attendee
    const attendeeIndex = event.attendees.findIndex(attendee => 
      attendee.user.toString() === userId
    );
    
    if (attendeeIndex === -1) {
      throw new Error('User not registered for this event');
    }
    
    const attendee = event.attendees[attendeeIndex];
    
    // Check if payment exists and is completed
    if (attendee.paymentStatus !== 'completed' || !attendee.paymentId) {
      throw new Error('No completed payment found for this registration');
    }
    
    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: attendee.paymentId,
      reason: 'requested_by_customer'
    });
    
    // Update attendee payment status
    attendee.paymentStatus = 'refunded';
    
    // Update user payment history
    const paymentIndex = user.paymentInfo?.paymentHistory?.findIndex(payment => 
      payment.paymentId === attendee.paymentId
    );
    
    if (paymentIndex !== -1 && paymentIndex !== undefined) {
      user.paymentInfo.paymentHistory[paymentIndex].status = 'refunded';
    }
    
    // Save changes
    await Promise.all([event.save(), user.save()]);
    
    return { 
      success: true, 
      message: 'Refund processed successfully',
      refundId: refund.id
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

module.exports = {
  createCustomer,
  createEventProduct,
  createPaymentIntent,
  processSuccessfulPayment,
  processRefund
}; 