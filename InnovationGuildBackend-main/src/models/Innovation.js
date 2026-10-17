const mongoose = require('mongoose');
const { INNOVATION_STAGES } = require('../utils/constants/innovationConstants');
const { AppError } = require('../utils/errorHandler');

const innovationSchema = new mongoose.Schema({
  innovatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  innovationName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  // Arrays — frontend sends multi-select (up to 3 values, lowercase e.g. 'agriculture')
  category: [{
    type: String,
    trim: true
  }],
  categoryOther: {
    type: String,
    trim: true
  },
  subcategory: [{
    type: String,
    trim: true
  }],
  subcategoryOther: {
    type: String,
    trim: true
  },
  media: {
    images: [{
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
      size: {
        type: Number,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      position: {
        type: Number,
        default: 0
      }
    }],
    videos: [{
      url: {
        type: String,
        required: true,
        trim: true
      },
      isExternal: {
        type: Boolean,
        default: false
      },
      filename: {
        type: String,
        trim: true
      },
      mimetype: {
        type: String,
        trim: true
      },
      objectName: {
        type: String,
        trim: true
      },
      size: {
        type: Number
      },
      uploadedAt: {
        type: Date
      },
      processingStatus: {
        type: String,
        enum: ['ORIGINAL', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'ORIGINAL'
      },
      processingError: {
        type: String
      },
      position: {
        type: Number,
        default: 0
      }
    }]
  },
  downloadableResources: [{
    type: {
      type: String,
      enum: ['PDF', 'DOCUMENT'],
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
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  yearLaunched: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  // Stage uses frontend values: 'idea' | 'mvp' | 'poc' | 'sales'
  innovationStage: {
    type: String,
    required: true,
    enum: INNOVATION_STAGES
  },
  // { min, max } object from frontend rangeStringSchema transform
  sellingPrice: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 }
  },
  numberOfUnitsInstalled: {
    type: Number,
    default: 0,
    min: 0
  },
  // String values: 'yes' | 'only_few' | 'not_any'
  distributorNetwork: {
    type: String,
    trim: true
  },
  salesLocation: [{
    type: String,
    trim: true
  }],
  powerSource: {
    type: String,
    trim: true
  },
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
  dimensions: {
    type: String,
    trim: true
  },
  // String (frontend sends string e.g. "50 kg")
  weight: {
    type: String,
    trim: true
  },
  // String (frontend sends free text)
  attachments: {
    type: String,
    trim: true
  },
  performanceParams: {
    type: String,
    trim: true
  },
  coveredOperations: [{
    type: String,
    trim: true
  }],
  manufacturingLocation: {
    type: String,
    trim: true
  },
  // Strings (frontend sends free text, not arrays)
  suitableCrops: {
    type: String,
    trim: true
  },
  suitableTerrains: {
    type: String,
    trim: true
  },
  suitableSoil: {
    type: String,
    trim: true
  },
  weatherConditions: {
    type: String,
    trim: true
  },
  otherUsageConditions: {
    type: String,
    trim: true
  },
  // String (free text, not array)
  importedParts: {
    type: String,
    trim: true
  },
  spareParts: {
    type: String,
    trim: true,
    enum: ['yes', 'no']
  },
  maintenanceTraining: {
    type: String,
    trim: true,
    enum: ['yes', 'no']
  },
  financingSupport: {
    type: String,
    trim: true,
    enum: ['yes', 'no', 'open_to_explore', 'not_needed']
  },
  technicalTraining: {
    type: String,
    trim: true,
    enum: ['yes', 'no', 'not_needed']
  },
  demoInstallations: {
    type: String,
    trim: true,
    enum: ['yes', 'no']
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['DRAFT', 'PUBLISHED', 'PENDING_APPROVAL', 'REJECTED'],
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

innovationSchema.pre('save', function(next) {
  if (!this.media?.images || this.media.images.length === 0) {
    return next(new AppError('At least one image is required for thumbnail', 400));
  }
  next();
});

innovationSchema.index({ innovatorId: 1 });
innovationSchema.index({ category: 1 });
innovationSchema.index({ subcategory: 1 });
innovationSchema.index({ innovationStage: 1 });
innovationSchema.index({ status: 1 });
innovationSchema.index({ createdAt: -1 });
innovationSchema.index({ views: -1 });
innovationSchema.index({ status: 1, category: 1, innovationStage: 1, createdAt: -1 });

module.exports = mongoose.model('Innovation', innovationSchema);
