const mongoose = require('mongoose');

const savedProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  savedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  timestamps: true
});

savedProfileSchema.index({ userId: 1, savedUserId: 1 }, { unique: true });
savedProfileSchema.index({ savedUserId: 1 });

savedProfileSchema.pre('save', function(next) {
  if (this.userId.toString() === this.savedUserId.toString()) {
    return next(new Error('Users cannot save their own profiles'));
  }
  next();
});

module.exports = mongoose.model('SavedProfile', savedProfileSchema);