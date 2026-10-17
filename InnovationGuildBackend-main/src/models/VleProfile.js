const mongoose = require('mongoose');
const { BUSINESS_MODEL_PERSONAS } = require('../utils/constants/businessModelConstants');
const { VLE_CATEGORIES, VLE_CATEGORY_OTHER } = require('../utils/constants/vleConstants');

const vleProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  registrationType: {
    type: String,
    enum: ['SELF_REGISTERED', 'AO_REGISTERED'],
    default: 'SELF_REGISTERED',
    uppercase: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 10,
    max: 100
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  village: {
    type: String,
    required: true,
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
  affiliatedOrg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  mainLivelihood: {
    type: String,
    required: true,
    trim: true
  },
  livelihoodExperience: {
    type: Number,
    required: true,
    min: 0
  },
  otherLivelihoods: {
    type: [String],
    default: []
  },
  yearlyRevenue: {
    type: Number,
    min: 0
  },
  qualification: {
    type: String,
    trim: true
  },
  languages: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one language must be specified'
    }
  },
  hasMachineExp: {
    type: Boolean
  },
  trainingsTaken: {
    type: String,
    trim: true
  },
  machineExpYears: {
    type: Number,
    min: 0,
    default: 0
  },
  machinesWorkedWith: {
    type: [String],
    default: []
  },
  vleCategory: {
    type: String,
    required: true,
    enum: VLE_CATEGORIES,
    trim: true
  },
  vleCategoryOther: {
    type: String,
    trim: true,
    required: function() {
      return this.vleCategory === VLE_CATEGORY_OTHER;
    }
  },
  interestedPersonas: {
    type: [String],
    enum: BUSINESS_MODEL_PERSONAS
  },
  supportAssessment: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        const valid = ['open_to_innovations', 'willing_to_travel', 'open_to_investments', 'has_smartphone', 'village_groups', 'literate_local_language', 'identify_tech_gaps', 'business_experience'];
        return v.every(s => valid.includes(s));
      },
      message: 'Invalid support assessment value'
    }
  },
  vleStatus: {
    type: String,
    enum: ['listed', 'interested', 'active', 'commercial'],
    default: 'listed'
  },
  trainings: {
    type: [String],
    enum: ['basic', 'innovation', 'advanced', 'other'],
    default: []
  },
  basicTrainingCenter: { type: String, trim: true },
  innovationTrainingCenter: { type: String, trim: true },
  advancedTrainingCenter: { type: String, trim: true },
  otherTrainingCenter: { type: String, trim: true }
}, {
  timestamps: true
});

vleProfileSchema.index({ village: 1, district: 1, state: 1 });
vleProfileSchema.index({ vleCategory: 1 });
vleProfileSchema.index({ affiliatedOrg: 1 });

module.exports = mongoose.model('VleProfile', vleProfileSchema);
