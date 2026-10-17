const mongoose = require('mongoose');

const masterOperationSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  isUserAdded: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('MasterOperation', masterOperationSchema);
