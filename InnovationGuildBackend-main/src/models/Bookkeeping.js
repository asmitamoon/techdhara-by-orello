const mongoose = require('mongoose');
const { REPORTING_PERIODS, RENTAL_TYPES } = require('../utils/constants/bookkeepingConstants');

const bookkeepingSchema = new mongoose.Schema({
  pilotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pilot',
    required: true,
    index: true
  },
  reportingPeriod: {
    type: String,
    required: true,
    enum: REPORTING_PERIODS,
    index: true
  },
  periodDate: {
    type: Date,
    required: true
  },

  // Sales
  unitsSold: {
    type: Number,
    min: [0, 'Units sold cannot be negative']
  },
  pricePerUnit: {
    type: Number,
    min: [0, 'Price per unit cannot be negative']
  },

  // Servicing
  unitsServiced: {
    type: Number,
    min: [0, 'Units serviced cannot be negative']
  },
  servicingType: {
    type: String,
    trim: true,
    maxlength: [50, 'Servicing type must be at most 50 characters']
  },
  avgServiceCharge: {
    type: Number,
    min: [0, 'Average service charge cannot be negative']
  },
  sparesReplaced: {
    type: String,
    trim: true,
    maxlength: [200, 'Spares replaced description must be at most 200 characters']
  },
  spareEarnings: {
    type: Number,
    min: [0, 'Spare earnings cannot be negative']
  },

  // Rental
  rentalType: {
    type: String,
    enum: RENTAL_TYPES
  },
  rentalCount: {
    type: Number,
    min: [0, 'Rental count cannot be negative']
  },
  rentalUsers: {
    type: Number,
    min: [0, 'Number of rental users cannot be negative']
  },
  rentalCharge: {
    type: Number,
    min: [0, 'Rental charge cannot be negative']
  },

  // Fabrication
  fabricationUnits: {
    type: Number,
    min: [0, 'Fabrication units cannot be negative']
  },
  fabricationCost: {
    type: Number,
    min: [0, 'Fabrication cost cannot be negative']
  },
  fabricationSellingPrice: {
    type: Number,
    min: [0, 'Fabrication selling price cannot be negative']
  },
  fabricationSold: {
    type: Number,
    min: [0, 'Fabrication units sold cannot be negative']
  }
}, {
  timestamps: true
});

bookkeepingSchema.index({ pilotId: 1, periodDate: 1, reportingPeriod: 1 }, { unique: true });

bookkeepingSchema.pre('validate', function(next) {
  if (this.fabricationSold != null && this.fabricationUnits != null) {
    if (this.fabricationSold > this.fabricationUnits) {
      return next(new Error('Units sold cannot exceed units fabricated'));
    }
  }
  next();
});

const Bookkeeping = mongoose.model('Bookkeeping', bookkeepingSchema);

module.exports = Bookkeeping;
