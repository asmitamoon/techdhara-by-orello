const mongoose = require('mongoose');
const {
  BUSINESS_MODELS_ADOPTED,
  TECHNOLOGY_TYPES,
  TRAINING_STATUS,
  PERFORMANCE_RATINGS,
  EASE_RATINGS,
  RELIABILITY_RATINGS,
  SPARES_AVAILABILITY,
  OPERATIONAL_CHALLENGES,
  DOWNTIME_OPTIONS,
  SUPPORT_OPTIONS,
  RECOMMEND_OPTIONS,
} = require('../utils/constants/fieldReportConstants');

const fieldReportSchema = new mongoose.Schema({
  pilotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pilot',
    required: [true, 'Pilot ID is required'],
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator (AO) ID is required'],
    index: true
  },
  reportDate: {
    type: Date,
    required: [true, 'Report date is required'],
    index: true
  },

  // Section 1: Basic Information
  businessModelAdopted: {
    type: String,
    enum: BUSINESS_MODELS_ADOPTED,
    required: [true, 'Business model adopted is required']
  },
  typeOfTechnology: {
    type: String,
    enum: TECHNOLOGY_TYPES,
    required: [true, 'Type of technology is required']
  },

  // Section 2: Training & Technical Performance
  receivedTraining: {
    type: String,
    enum: TRAINING_STATUS,
    required: [true, 'Training status is required']
  },
  machinePerformance: {
    type: String,
    enum: PERFORMANCE_RATINGS,
    required: [true, 'Machine performance rating is required']
  },
  easeOfOperation: {
    type: String,
    enum: EASE_RATINGS,
    required: [true, 'Ease of operation rating is required']
  },
  machineReliability: {
    type: String,
    enum: RELIABILITY_RATINGS,
    required: [true, 'Machine reliability rating is required']
  },
  availabilityOfSpares: {
    type: String,
    enum: SPARES_AVAILABILITY,
    required: [true, 'Availability of spares is required']
  },

  // Section 3: Operations & Maintenance
  easeOfMaintenance: {
    type: String,
    enum: EASE_RATINGS,
    required: [true, 'Ease of maintenance rating is required']
  },
  operationalChallenges: [{
    type: String,
    enum: OPERATIONAL_CHALLENGES
  }],
  downtimeExperience: {
    type: String,
    enum: DOWNTIME_OPTIONS,
    required: [true, 'Downtime experience is required']
  },
  additionalComments: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Section 4: Support & Ecosystem
  supportReceived: {
    type: String,
    enum: SUPPORT_OPTIONS,
    required: [true, 'Support received is required']
  },
  supportNeeded: {
    type: String,
    enum: SUPPORT_OPTIONS,
    required: [true, 'Support needed is required']
  },

  // Section 5: Future Outlook
  recommendToOthers: {
    type: String,
    enum: RECOMMEND_OPTIONS,
    required: [true, 'Recommendation status is required']
  },
  improvementSuggestions: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

fieldReportSchema.index({ pilotId: 1, reportDate: 1 }, { unique: true });
fieldReportSchema.index({ pilotId: 1, createdAt: -1 });
fieldReportSchema.index({ createdBy: 1, createdAt: -1 });

fieldReportSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Pilot = mongoose.model('Pilot');
    const User = mongoose.model('User');
    const VleProfile = mongoose.model('VleProfile');

    const pilot = await Pilot.findById(this.pilotId);
    if (!pilot) {
      return next(new Error('Pilot not found'));
    }

    if (!['TRIAL_STARTED', 'IMPLEMENTED'].includes(pilot.status)) {
      return next(new Error('Field reports can only be created for pilots in TRIAL_STARTED or IMPLEMENTED status'));
    }

    const creator = await User.findById(this.createdBy);
    if (!creator) {
      return next(new Error('Creator not found'));
    }

    const isAdmin = creator.role === 'ADMIN' || creator.role === 'SUPER_ADMIN';

    if (!isAdmin && creator.role !== 'AO') {
      return next(new Error('Only AOs or admins can create field reports'));
    }

    if (!isAdmin) {
      const vleProfile = await VleProfile.findOne({ userId: pilot.vleId });
      if (!vleProfile) {
        return next(new Error('VLE profile not found'));
      }

      if (!vleProfile.affiliatedOrg || vleProfile.affiliatedOrg.toString() !== this.createdBy.toString()) {
        return next(new Error('You can only create field reports for VLEs you registered'));
      }
    }
  } else {
    return next(new Error('Field reports cannot be modified after submission'));
  }

  next();
});

module.exports = mongoose.model('FieldReport', fieldReportSchema);
