const mongoose = require('mongoose');

const newsletterSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email address'
    }
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);
