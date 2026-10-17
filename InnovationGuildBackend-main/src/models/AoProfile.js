const mongoose = require('mongoose');

const aoProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  orgName: {
    type: String,
    required: true,
    trim: true
  },
  orgType: {
    type: String,
    required: true,
    trim: true,
    enum: ['fpc', 'shg', 'ngo', 'other']
  },
  orgTypeOther: {
    type: String,
    trim: true
  },
  streamOfWork: {
    type: [String],
    required: true,
    validate: [
      {
        validator: function(v) { return v && v.length > 0; },
        message: 'At least one stream of work must be selected'
      },
      {
        validator: function(v) {
          const valid = ['agriculture', 'skill_building', 'livelihoods', 'textiles', 'arts_crafts', 'climate_change', 'other'];
          return v.every(s => valid.includes(s));
        },
        message: 'Invalid stream of work value'
      }
    ]
  },
  streamOfWorkOther: {
    type: String,
    trim: true
  },
  pocName: {
    type: String,
    required: true,
    trim: true
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
  registrationType: {
    type: String,
    required: true,
    enum: ['NODAL_ORG_REGISTERED', 'SELF_REGISTERED'],
    default: 'SELF_REGISTERED',
    uppercase: true
  },
  nodalOrg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

aoProfileSchema.index({ orgName: 1 });
aoProfileSchema.index({ village: 1, district: 1, state: 1 });
aoProfileSchema.index({ orgType: 1 });
aoProfileSchema.index({ nodalOrg: 1 });
aoProfileSchema.index({ registrationType: 1 });
aoProfileSchema.index({ nodalOrg: 1, userId: 1 });

module.exports = mongoose.model('AoProfile', aoProfileSchema);
