const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: function() {
      return this.isEmailUser;
    },
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: function() {
      return this.isPhoneUser;
    },
    unique: true,
    sparse: true,
    trim: true
  },
  profilePicture: {
    type: String,
    trim: true
  },
  passwordHash: {
    type: String,
    required: function() {
      return this.isEmailUser;
    }
  },
  isEmailUser: {
    type: Boolean,
    default: false
  },
  isPhoneUser: {
    type: Boolean,
    default: false
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,  // allows multiple null values (non-Google users and migrated users start without it)
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', 'NO', 'VLE', 'INNOVATOR', 'AO', 'GENERAL_USER'],
    uppercase: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'BANNED'],
    default: 'PENDING',
    uppercase: true
  },
  registrationComplete: {
    type: Boolean,
    default: false
  },
  editRequested: {
    type: Boolean,
    default: false
  },
  editRequestReason: {
    type: String,
    trim: true
  },
  signUpDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  return userObject;
};

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model('User', userSchema);