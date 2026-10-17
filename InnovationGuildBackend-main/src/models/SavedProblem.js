const mongoose = require('mongoose');

const savedProblemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InnovationRequest',
    required: true
  },
}, {
  timestamps: true
});

savedProblemSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('SavedProblem', savedProblemSchema);
