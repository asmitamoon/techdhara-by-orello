const mongoose = require('mongoose');

const pilotSchema = new mongoose.Schema({
  innovationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Innovation',
    required: [true, 'Innovation ID is required'],
    index: true
  },
  vleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'VLE ID is required'],
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PILOT_STARTED', 'TRIAL_STARTED', 'IMPLEMENTED', 'CANCELLED'],
    default: 'PENDING',
    uppercase: true,
    index: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InnovationRequest'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  startedAt: {
    type: Date
  },
  trialStartedAt: {
    type: Date
  },
  implementedAt: {
    type: Date
  }
}, {
  timestamps: true
});

pilotSchema.index({ innovationId: 1, vleId: 1 }, { unique: true });
pilotSchema.index({ status: 1, createdAt: -1 });

pilotSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Innovation = mongoose.model('Innovation');
    const User = mongoose.model('User');

    const innovation = await Innovation.findById(this.innovationId);
    if (!innovation) {
      return next(new Error('Innovation not found'));
    }

    if (innovation.status !== 'PUBLISHED') {
      return next(new Error('Can only create pilots for published innovations'));
    }

    const vle = await User.findById(this.vleId);
    if (!vle) {
      return next(new Error('VLE not found'));
    }

    if (vle.role !== 'VLE') {
      return next(new Error('Pilot participant must be a VLE'));
    }

    if (vle.status !== 'APPROVED') {
      return next(new Error('VLE must have APPROVED status'));
    }
  }

  next();
});

module.exports = mongoose.model('Pilot', pilotSchema);
