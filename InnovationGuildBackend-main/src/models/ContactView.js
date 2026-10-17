const mongoose = require('mongoose');

const contactViewSchema = new mongoose.Schema({
  viewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  timestamps: true
});

contactViewSchema.index({ viewerId: 1 });
contactViewSchema.index({ viewedUserId: 1 });
contactViewSchema.index({ createdAt: -1 });
contactViewSchema.index({ viewerId: 1, viewedUserId: 1 }, { unique: true });

contactViewSchema.pre('save', function(next) {
  if (this.viewerId.toString() === this.viewedUserId.toString()) {
    return next(new Error('Users cannot view their own contact details'));
  }
  next();
});

module.exports = mongoose.model('ContactView', contactViewSchema);
