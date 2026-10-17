const mongoose = require('mongoose');
const { UNIT_TYPES, OWNERSHIP_TYPES } = require('../utils/constants/problemConstants');

const serviceRequestSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  registrationType: {
    type: String,
    enum: ['SELF_CREATED', 'AO_CREATED', 'NO_CREATED'],
    default: 'SELF_CREATED',
    uppercase: true
  },
  unitType: {
    type: String,
    enum: UNIT_TYPES,
    required: true,
    trim: true
  },
  techName: {
    type: String,
    required: true,
    trim: true
  },
  techSpecs: {
    type: String,
    required: true,
    trim: true
  },
  // Optional — frontend "techCompanyNotAvailable" checkbox is stripped before sending;
  // if checked, techCompany may be absent or empty
  techCompany: {
    type: String,
    trim: true
  },
  // Stored as range object { min, max } — single values have min === max
  cost: {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 }
  },
  ownership: {
    type: String,
    enum: OWNERSHIP_TYPES,
    required: true,
    trim: true
  },
  // Required by frontend when ownership='Individual'; optional otherwise
  individualBusinessPlan: {
    type: String,
    trim: true
  },
  challenges: {
    type: String,
    required: true,
    trim: true
  },
  // URL string (frontend validates as URL, empty string allowed)
  photosLink: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['DRAFT', 'PUBLISHED'],
    default: 'DRAFT',
    uppercase: true
  }
}, {
  timestamps: true
});

serviceRequestSchema.index({ postedBy: 1 });
serviceRequestSchema.index({ registeredBy: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ unitType: 1 });
serviceRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
