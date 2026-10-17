const mongoose = require('mongoose');

const pipelineInnovatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  enterprise: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  emailId: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    trim: true,
    default: '',
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('PipelineInnovator', pipelineInnovatorSchema);
