const mongoose = require('mongoose');

const savedInnovationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  innovationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Innovation',
    required: true
  },
}, {
  timestamps: true
});

savedInnovationSchema.index({ userId: 1, innovationId: 1 }, { unique: true });

module.exports = mongoose.model('SavedInnovation', savedInnovationSchema);