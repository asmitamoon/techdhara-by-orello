const mongoose = require('mongoose');

const generalUserProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
  state: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  village: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  }
}, {
  timestamps: true
});

generalUserProfileSchema.index({ village: 1, district: 1, state: 1 });

module.exports = mongoose.model('GeneralUserProfile', generalUserProfileSchema);
