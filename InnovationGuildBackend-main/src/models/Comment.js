const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InnovationRequest'
  },
  innovationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Innovation'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

commentSchema.pre('save', function(next) {
  if (!this.problemId && !this.innovationId) {
    return next(new Error('Comment must be associated with either a problem or an innovation'));
  }
  if (this.problemId && this.innovationId) {
    return next(new Error('Comment cannot be associated with both a problem and an innovation'));
  }
  next();
});

commentSchema.index({ problemId: 1, createdAt: -1 });
commentSchema.index({ innovationId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });

module.exports = mongoose.model('Comment', commentSchema);