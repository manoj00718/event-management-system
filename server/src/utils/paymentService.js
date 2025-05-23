// Mock payment service implementation
// Removed Stripe dependency to simplify the app

// Mock function implementations
const createPaymentIntent = async (eventId, amount, currency = 'usd', metadata = {}) => {
  console.log('Mock payment intent created:', { eventId, amount, currency, metadata });
  return {
    id: `mock_payment_${Date.now()}`,
    amount: amount,
    currency: currency,
    status: 'succeeded',
    client_secret: `mock_secret_${Date.now()}`,
    metadata
  };
};

const confirmPayment = async (paymentIntentId) => {
  console.log('Mock payment confirmed:', paymentIntentId);
  return {
    id: paymentIntentId,
    status: 'succeeded',
    updated: new Date().toISOString()
  };
};

const createRefund = async (paymentIntentId, amount) => {
  console.log('Mock refund created:', { paymentIntentId, amount });
  return {
    id: `mock_refund_${Date.now()}`,
    payment_intent: paymentIntentId,
    amount: amount,
    status: 'succeeded'
  };
};

const createEventProduct = async (event) => {
  console.log('Mock product created for event:', event.title);
  return {
    id: `mock_product_${Date.now()}`,
    name: event.title,
    description: event.description,
    metadata: { eventId: event._id }
  };
};

const getPaymentHistory = async (userId) => {
  console.log('Getting mock payment history for user:', userId);
  return {
    payments: [],
    refunds: []
  };
};

// Export the mock functions
module.exports = {
  createPaymentIntent,
  confirmPayment,
  createRefund,
  createEventProduct,
  getPaymentHistory
}; 