const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InnovationRequest',
    required: true
  },
  innovationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Innovation',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0
  },
  scoreBreakdown: {
    operationMatch: {
      type: Number,
      required: true,
      min: 0
    },
    rawMaterialMatch: {
      type: Number,
      required: true,
      min: 0
    }
  },
  matchDetails: {
    matchedOperations: [{
      type: String,
      trim: true
    }],
    matchedCrops: [{
      type: String,
      trim: true
    }]
  },
  locationMatch: {
    stateMatch: {
      type: Boolean,
      required: true
    },
    districtMatch: {
      type: Boolean,
      required: true
    },
    problemLocation: {
      state: {
        type: String,
        trim: true
      },
      district: {
        type: String,
        trim: true
      },
      village: {
        type: String,
        trim: true
      }
    },
    innovationLocation: {
      state: {
        type: String,
        trim: true
      },
      district: {
        type: String,
        trim: true
      }
    }
  }
}, {
  timestamps: true
});

matchSchema.index({ problemId: 1, matchScore: -1 });
matchSchema.index({ innovationId: 1, matchScore: -1 });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
