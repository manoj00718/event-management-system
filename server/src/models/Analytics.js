const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  views: {
    total: { type: Number, default: 0 },
    unique: { type: Number, default: 0 },
    history: [{
      date: { type: Date, default: Date.now },
      count: { type: Number, default: 0 }
    }]
  },
  registrations: {
    total: { type: Number, default: 0 },
    confirmed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    history: [{
      date: { type: Date, default: Date.now },
      count: { type: Number, default: 0 },
      type: { type: String, enum: ['register', 'confirm', 'cancel'] }
    }]
  },
  demographics: {
    locations: [{
      city: String,
      country: String,
      count: { type: Number, default: 0 }
    }],
    devices: [{
      type: String,
      count: { type: Number, default: 0 }
    }]
  },
  engagement: {
    shares: {
      total: { type: Number, default: 0 },
      platforms: [{
        name: String,
        count: { type: Number, default: 0 }
      }]
    },
    favorites: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  revenue: {
    total: { type: Number, default: 0 },
    tickets: [{
      type: String,
      price: Number,
      sold: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }]
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to increment view count
analyticsSchema.methods.incrementViews = async function(isUnique = false) {
  this.views.total += 1;
  if (isUnique) {
    this.views.unique += 1;
  }
  this.views.history.push({
    date: new Date(),
    count: 1
  });
  this.lastUpdated = new Date();
  await this.save();
};

// Method to add registration
analyticsSchema.methods.addRegistration = async function(type = 'register') {
  this.registrations.total += (type === 'register' ? 1 : 0);
  this.registrations.confirmed += (type === 'confirm' ? 1 : 0);
  this.registrations.cancelled += (type === 'cancel' ? 1 : 0);
  this.registrations.history.push({
    date: new Date(),
    count: 1,
    type
  });
  this.lastUpdated = new Date();
  await this.save();
};

// Method to update revenue
analyticsSchema.methods.updateRevenue = async function(ticketType, price, quantity) {
  let ticket = this.revenue.tickets.find(t => t.type === ticketType);
  if (!ticket) {
    ticket = {
      type: ticketType,
      price: price,
      sold: 0,
      revenue: 0
    };
    this.revenue.tickets.push(ticket);
  }
  ticket.sold += quantity;
  ticket.revenue += price * quantity;
  this.revenue.total += price * quantity;
  this.lastUpdated = new Date();
  await this.save();
};

// Static method to get event insights
analyticsSchema.statics.getEventInsights = async function(eventId) {
  return this.findOne({ event: eventId })
    .populate('event', 'title date location')
    .lean();
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics; 