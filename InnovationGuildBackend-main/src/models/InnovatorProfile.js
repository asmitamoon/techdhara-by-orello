const mongoose = require('mongoose');

const innovatorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  enterpriseName: {
    type: String,
    trim: true,
    default: 'NA'
  },
  startDate: {
    type: Date
  },
  links: {
    type: String,
    trim: true
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

innovatorProfileSchema.index({ enterpriseName: 1 });
innovatorProfileSchema.index({ district: 1 });
innovatorProfileSchema.index({ state: 1 });

module.exports = mongoose.model('InnovatorProfile', innovatorProfileSchema);
