const mongoose = require('mongoose');

const innovationRequestSchema = new mongoose.Schema({
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
  problemTitle: {
    type: String,
    required: true,
    trim: true
  },
  problemDescription: {
    type: String,
    required: true,
    trim: true
  },
  regionState: {
    type: String,
    trim: true
  },
  regionDistrict: {
    type: String,
    trim: true
  },
  regionVillage: {
    type: String,
    trim: true
  },
  // '' when 'others' selected (frontend transform sets category='' and keeps categoryOther)
  category: {
    type: String,
    trim: true
  },
  categoryOther: {
    type: String,
    trim: true
  },
  // Array of PROBLEM_SUBCATEGORIES values (value chain stages)
  valueChainStages: [{
    type: String,
    trim: true
  }],
  crops: {
    type: String,
    trim: true
  },
  operationsUndertaken: [{
    type: String,
    trim: true
  }],
  machineOperations: [{
    type: String,
    trim: true
  }],
  currentMethodology: {
    type: String,
    trim: true
  },
  knowMachinery: {
    type: String,
    trim: true,
    enum: ['yes', 'no']
  },
  machineChallenge: {
    type: String,
    trim: true
  },
  energySource: [{
    type: String,
    trim: true
  }],
  // Optional — frontend "not known" checkbox strips pullCapacityNotKnown before sending;
  // if checked, pullCapacity may be absent from payload
  pullCapacity: {
    type: String,
    trim: true
  },
  engineCapacity: {
    type: String,
    trim: true
  },
  motorCapacity: {
    type: String,
    trim: true
  },
  renewableType: {
    type: String,
    trim: true
  },
  specificInfo: {
    type: String,
    trim: true
  },
  problemSize: {
    type: String,
    trim: true
  },
  endProducts: {
    type: String,
    trim: true
  },
  salesChannels: {
    type: String,
    trim: true
  },
  newChannels: {
    type: String,
    trim: true
  },
  // Already transformed to numbers by frontend numericStringSchema
  currentRevenue: {
    type: Number,
    min: 0
  },
  expectedRevenue: {
    type: Number,
    min: 0
  },
  machineBudget: {
    type: Number,
    min: 0
  },
  // File fields — set by controller from multipart upload, not from body schema
  coverImage: {
    type: String,
    trim: true
  },
  mediaFiles: [{
    type: {
      type: String,
      enum: ['IMAGE', 'PDF', 'VIDEO'],
      uppercase: true,
      required: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    filename: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true,
      trim: true
    },
    objectName: {
      type: String,
      required: true,
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  upvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED'],
    default: 'DRAFT',
    uppercase: true
  },
  approvedAt: { type: Date, default: null },
  rejectionReason: {
    type: String,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  matchingEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

innovationRequestSchema.index({ postedBy: 1 });
innovationRequestSchema.index({ registeredBy: 1 });
innovationRequestSchema.index({ problemTitle: 'text', problemDescription: 'text' });
innovationRequestSchema.index({ status: 1 });
innovationRequestSchema.index({ category: 1 });
innovationRequestSchema.index({ upvotes: -1 });
innovationRequestSchema.index({ status: 1, category: 1, createdAt: -1 });
innovationRequestSchema.index({ keywords: 'text' });

module.exports = mongoose.model('InnovationRequest', innovationRequestSchema);
