const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  type: {
    type: String,
    enum: [
      'NEW_USER_REGISTERED',
      'NEW_INNOVATION_SUBMITTED',
      'NEW_PROBLEM_SUBMITTED',
      'NEW_SERVICE_REQUEST_SUBMITTED',
      'NEW_NODAL_ORG_REGISTERED',
      'NEW_AO_REGISTERED',
      'PILOT_IMPLEMENTED',
      'FIELD_REPORT_SUBMITTED',
      'GENERAL',
      'INNOVATION_APPROVED',
      'INNOVATION_REJECTED',
      'PROBLEM_APPROVED',
      'PROBLEM_REJECTED',
      'SERVICE_REQUEST_APPROVED',
      'SERVICE_REQUEST_REJECTED',
      'PILOT_STATUS_CHANGED',
      'USER_APPROVED',
      'USER_REJECTED',
      'AO_APPROVED',
      'AO_REJECTED',
      'AO_PENDING',
      'COMMENT_RECEIVED',
      'EDIT_REQUESTED',
      'REGISTRATION_RECEIVED',
      'VLE_REGISTERED_BY_AO',
      'PROBLEM_CREATED_FOR_VLE',
      'NEW_INNOVATION_PUBLISHED',
      'NEW_PROBLEM_PUBLISHED',
      'NEW_AO_APPROVED',
      'PILOT_REQUEST_RECEIVED',
      'PILOT_REQUEST_SUBMITTED',
      'VLE_PILOT_REQUEST',
      'VLE_SUBMITTED_PROBLEM',
      'VLE_REGISTERED_CONFIRMED',
      'BUSINESS_MODEL_SUBMITTED'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  // Optional reference to the entity that triggered the notification
  entityType: {
    type: String,
    enum: ['User', 'Innovation', 'Problem', 'InnovationRequest', 'ServiceRequest', 'Pilot', 'FieldReport', 'AoProfile', null],
    default: null
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
