const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String
  }
} , {
  timestamps: true
});

// Auto-delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient lookups
refreshTokenSchema.index({ userId: 1 });

// Method to check if token is valid
refreshTokenSchema.methods.isValid = function() {
  return !this.isRevoked && this.expiresAt > new Date();
};

// Method to revoke token
refreshTokenSchema.methods.revoke = function() {
  this.isRevoked = true;
  return this.save();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);