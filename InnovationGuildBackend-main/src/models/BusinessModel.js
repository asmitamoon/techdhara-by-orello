const mongoose = require('mongoose');
const { BUSINESS_MODEL_PERSONAS } = require('../utils/constants/businessModelConstants');

const businessModelSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  innovationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Innovation',
    required: true
  },
  pilotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pilot',
    required: true
  },
  personaInterest: [{
    type: String,
    enum: BUSINESS_MODEL_PERSONAS,
    trim: true
  }],
  assessmentReadiness: [{
    type: String,
    trim: true
  }],

  // Rental fields (present when 'rental' in personaInterest)
  initialCost: {
    type: Number,
    min: 0
  },
  // Allows decimals (frontend fieldCapacitySchema: /^\d*(\.\d+)?$/)
  fieldCapacity: {
    type: Number,
    min: 0
  },
  customHiringCharges: {
    type: Number,
    min: 0
  },
  estimatedRevenue: {
    type: Number,
    min: 0
  },
  paybackPeriod: {
    type: Number,
    min: 0
  },

  // Sales fields (present when 'sales' in personaInterest)
  inventoryCosts: {
    type: Number,
    min: 0
  },
  logisticsCosts: {
    type: Number,
    min: 0
  },
  salesTargetYear: {
    type: Number,
    min: 0
  },
  commissionsPlanned: {
    type: Number,
    min: 0
  },
  estimatedRevenueSales: {
    type: Number,
    min: 0
  },

  // Servicing fields (present when 'servicing' in personaInterest)
  servicingInventoryCosts: {
    type: Number,
    min: 0
  },
  servicingLogisticsCosts: {
    type: Number,
    min: 0
  },
  servicingTargetYear: {
    type: Number,
    min: 0
  },
  servicingCommissionPlanned: {
    type: Number,
    min: 0
  },

  // Fabrication fields (present when 'fabrication' in personaInterest)
  machinesPlanned: {
    type: Number,
    min: 0
  },
  costFabrication: {
    type: Number,
    min: 0
  },
  sellingPrice: {
    type: Number,
    min: 0
  },
  estimatedRevenueAssembly: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

businessModelSchema.index({ postedBy: 1 });
businessModelSchema.index({ innovationId: 1 });
businessModelSchema.index({ pilotId: 1 }, { unique: true });
businessModelSchema.index({ postedBy: 1, innovationId: 1 }, { unique: true });

module.exports = mongoose.model('BusinessModel', businessModelSchema);
