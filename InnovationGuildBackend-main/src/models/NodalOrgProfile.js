const mongoose = require('mongoose');

const nodalOrgProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  orgName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200
  },
  hqState: {
    type: String,
    required: true,
    trim: true
  },
  orgType: {
    type: String,
    required: true,
    enum: ['non-profit', 'for-profit', 'government', 'hybrid']
  },
  operationalStates: {
    type: [String],
    default: []
  },
  numberOfAffiliatedOrgs: {
    type: Number,
    default: 0,
    min: 0
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
      },
      message: 'Please provide a valid website URL'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  hasRuralPrograms: {
    type: String,
    enum: ['yes', 'no', 'under_progress']
  },
  hasTechIntegration: {
    type: String,
    enum: ['yes', 'no', 'under_progress']
  },
  channels: {
    type: [String],
    enum: [
      'Own Organization Branches',
      'FPOs / FPCs',
      'Cooperatives',
      'Gram Panchayats',
      'Other formal village or block level set-ups'
    ],
    default: []
  },
  potentialAoCount: {
    type: Number,
    min: 1,
    max: 10000
  }
}, {
  timestamps: true
});

nodalOrgProfileSchema.index({ orgName: 1 });
nodalOrgProfileSchema.index({ hqState: 1 });

module.exports = mongoose.model('NodalOrgProfile', nodalOrgProfileSchema);
