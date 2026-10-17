const { sendInnovationApprovalEmail, sendInnovationRejectionEmail, sendProblemApprovalEmail, sendProblemRejectionEmail, sendServiceRequestApprovalEmail, sendServiceRequestRejectionEmail } = require('../channels/email');
const { sendWhatsAppInnovationApproval, sendWhatsAppInnovationRejection, sendWhatsAppProblemApproval, sendWhatsAppProblemRejection, sendWhatsAppServiceRequestApproval, sendWhatsAppServiceRequestRejection } = require('../channels/whatsapp');
const { sendInnovationApprovalSMS, sendInnovationRejectionSMS, sendProblemApprovalSMS, sendProblemRejectionSMS, sendServiceRequestApprovalSMS, sendServiceRequestRejectionSMS } = require('../channels/sms');
const Notification = require('../../../models/Notification');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const sendInnovationApprovalNotification = async (innovation, innovator) => {
  const userName = innovator.fullName || 'Innovator';
  const notifications = [];

  const phone = await resolvePhoneNumber(innovator);
  if (phone) {
    try {
      await sendWhatsAppInnovationApproval(phone, userName, innovation.innovationName);
      notifications.push('whatsapp');
      console.log(`✅ Innovation approval WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send innovation approval WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendInnovationApprovalSMS(phone, userName, innovation.innovationName);
      notifications.push('sms');
      console.log(`✅ Innovation approval SMS sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send innovation approval SMS to ${phone}:`, error.message);
    }
  } else if ((innovator.isEmailUser || innovator.isGoogleUser) && innovator.isEmailVerified && innovator.email) {
    try {
      await sendInnovationApprovalEmail(innovator.email, userName, innovation.innovationName, innovation._id);
      notifications.push('email');
      console.log(`✅ Innovation approval email sent to ${innovator.email}`);
    } catch (error) {
      console.error(`❌ Failed to send innovation approval email to ${innovator.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for innovation ${innovation._id} - no verified contact methods`);
  }

  try {
    await Notification.create({
      recipient: innovator._id,
      type: 'INNOVATION_APPROVED',
      title: 'Innovation Approved',
      message: `Your innovation "${innovation.innovationName}" has been approved and is now published.`,
      entityType: 'Innovation',
      entityId: innovation._id
    });
  } catch (err) {
    console.error('Failed to save in-app innovation approval notification:', err.message);
  }

  return notifications;
};

const sendInnovationRejectionNotification = async (innovation, innovator, reason) => {
  const userName = innovator.fullName || 'Innovator';
  const notifications = [];

  const phone = await resolvePhoneNumber(innovator);
  if (phone) {
    try {
      await sendWhatsAppInnovationRejection(phone, userName, innovation.innovationName, reason);
      notifications.push('whatsapp');
      console.log(`✅ Innovation rejection WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send innovation rejection WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendInnovationRejectionSMS(phone, userName, innovation.innovationName, reason);
      notifications.push('sms');
      console.log(`✅ Innovation rejection SMS sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send innovation rejection SMS to ${phone}:`, error.message);
    }
  } else if ((innovator.isEmailUser || innovator.isGoogleUser) && innovator.isEmailVerified && innovator.email) {
    try {
      await sendInnovationRejectionEmail(innovator.email, userName, innovation.innovationName, reason);
      notifications.push('email');
      console.log(`✅ Innovation rejection email sent to ${innovator.email}`);
    } catch (error) {
      console.error(`❌ Failed to send innovation rejection email to ${innovator.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for innovation ${innovation._id} - no verified contact methods`);
  }

  try {
    await Notification.create({
      recipient: innovator._id,
      type: 'INNOVATION_REJECTED',
      title: 'Innovation Rejected',
      message: `Your innovation "${innovation.innovationName}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      entityType: 'Innovation',
      entityId: innovation._id
    });
  } catch (err) {
    console.error('Failed to save in-app innovation rejection notification:', err.message);
  }

  return notifications;
};

const sendProblemApprovalNotification = async (problem, poster) => {
  const userName = poster.fullName || 'User';
  const notifications = [];

  const phone = await resolvePhoneNumber(poster);
  if (phone) {
    try {
      await sendWhatsAppProblemApproval(phone, userName, problem.problemTitle);
      notifications.push('whatsapp');
      console.log(`✅ Problem approval WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send problem approval WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendProblemApprovalSMS(phone, userName, problem.problemTitle);
      notifications.push('sms');
      console.log(`✅ Problem approval SMS sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send problem approval SMS to ${phone}:`, error.message);
    }
  } else if ((poster.isEmailUser || poster.isGoogleUser) && poster.isEmailVerified && poster.email) {
    try {
      await sendProblemApprovalEmail(poster.email, userName, problem.problemTitle, problem._id);
      notifications.push('email');
      console.log(`✅ Problem approval email sent to ${poster.email}`);
    } catch (error) {
      console.error(`❌ Failed to send problem approval email to ${poster.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for problem ${problem._id} - no verified contact methods`);
  }

  try {
    await Notification.create({
      recipient: poster._id,
      type: 'PROBLEM_APPROVED',
      title: 'Problem Approved',
      message: `Your problem "${problem.problemTitle}" has been approved and is now published.`,
      entityType: 'Problem',
      entityId: problem._id
    });
  } catch (err) {
    console.error('Failed to save in-app problem approval notification:', err.message);
  }

  return notifications;
};

const sendProblemRejectionNotification = async (problem, poster, reason) => {
  const userName = poster.fullName || 'User';
  const notifications = [];

  const phone = await resolvePhoneNumber(poster);
  if (phone) {
    try {
      await sendWhatsAppProblemRejection(phone, userName, problem.problemTitle, reason);
      notifications.push('whatsapp');
      console.log(`✅ Problem rejection WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send problem rejection WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendProblemRejectionSMS(phone, userName, problem.problemTitle, reason);
      notifications.push('sms');
      console.log(`✅ Problem rejection SMS sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send problem rejection SMS to ${phone}:`, error.message);
    }
  } else if ((poster.isEmailUser || poster.isGoogleUser) && poster.isEmailVerified && poster.email) {
    try {
      await sendProblemRejectionEmail(poster.email, userName, problem.problemTitle, reason);
      notifications.push('email');
      console.log(`✅ Problem rejection email sent to ${poster.email}`);
    } catch (error) {
      console.error(`❌ Failed to send problem rejection email to ${poster.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for problem ${problem._id} - no verified contact methods`);
  }

  try {
    await Notification.create({
      recipient: poster._id,
      type: 'PROBLEM_REJECTED',
      title: 'Problem Rejected',
      message: `Your problem "${problem.problemTitle}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      entityType: 'Problem',
      entityId: problem._id
    });
  } catch (err) {
    console.error('Failed to save in-app problem rejection notification:', err.message);
  }

  return notifications;
};

const sendServiceRequestApprovalNotification = async (serviceRequest, poster) => {
  const userName = poster.fullName || 'there';
  const techName = serviceRequest.techName;
  const notifications = [];

  const phone = await resolvePhoneNumber(poster);
  if (phone) {
    try {
      await sendWhatsAppServiceRequestApproval(phone, userName, techName);
      notifications.push('whatsapp');
      console.log(`✅ Service request approval WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send service request approval WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendServiceRequestApprovalSMS(phone, userName, techName);
      notifications.push('sms');
      console.log(`✅ Service request approval SMS sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send service request approval SMS to ${phone}:`, error.message);
    }
  } else if ((poster.isEmailUser || poster.isGoogleUser) && poster.isEmailVerified && poster.email) {
    try {
      await sendServiceRequestApprovalEmail(poster.email, userName, techName);
      notifications.push('email');
      console.log(`✅ Service request approval email sent to ${poster.email}`);
    } catch (error) {
      console.error(`❌ Failed to send service request approval email to ${poster.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for service request approval to user ${poster._id} - no verified contact methods`);
  }

  try {
    await Notification.create({
      recipient: poster._id,
      type: 'SERVICE_REQUEST_APPROVED',
      title: 'Service Request Approved',
      message: `Your service request "${techName}" has been approved and is now published.`,
      entityType: 'ServiceRequest',
      entityId: serviceRequest._id
    });
  } catch (err) {
    console.error('Failed to save in-app service request approval notification:', err.message);
  }

  return notifications;
};

const sendServiceRequestRejectionNotification = async (serviceRequest, poster, reason) => {
  const userName = poster.fullName || 'there';
  const techName = serviceRequest.techName;
  const notifications = [];

  const phone = await resolvePhoneNumber(poster);
  if (phone) {
    try {
      await sendWhatsAppServiceRequestRejection(phone, userName, techName, reason);
      notifications.push('whatsapp');
      console.log(`✅ Service request rejection WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send service request rejection WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendServiceRequestRejectionSMS(phone, userName, techName, reason);
      notifications.push('sms');
      console.log(`✅ Service request rejection SMS sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send service request rejection SMS to ${phone}:`, error.message);
    }
  } else if ((poster.isEmailUser || poster.isGoogleUser) && poster.isEmailVerified && poster.email) {
    try {
      await sendServiceRequestRejectionEmail(poster.email, userName, techName, reason);
      notifications.push('email');
      console.log(`✅ Service request rejection email sent to ${poster.email}`);
    } catch (error) {
      console.error(`❌ Failed to send service request rejection email to ${poster.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for service request rejection to user ${poster._id} - no verified contact methods`);
  }

  try {
    await Notification.create({
      recipient: poster._id,
      type: 'SERVICE_REQUEST_REJECTED',
      title: 'Service Request Rejected',
      message: `Your service request "${techName}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      entityType: 'ServiceRequest',
      entityId: serviceRequest._id
    });
  } catch (err) {
    console.error('Failed to save in-app service request rejection notification:', err.message);
  }

  return notifications;
};

module.exports = {
  sendInnovationApprovalNotification,
  sendInnovationRejectionNotification,
  sendProblemApprovalNotification,
  sendProblemRejectionNotification,
  sendServiceRequestApprovalNotification,
  sendServiceRequestRejectionNotification
};
