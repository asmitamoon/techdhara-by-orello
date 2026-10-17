const { sendApprovalEmail, sendRejectionEmail } = require('../channels/email');
const { sendWhatsAppApproval, sendWhatsAppRejection } = require('../channels/whatsapp');
const { sendApprovalSMS, sendRejectionSMS } = require('../channels/sms');
const Notification = require('../../../models/Notification');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const sendApprovalNotification = async (user) => {
  const userName = user.fullName || 'User';
  const notifications = [];

  const phone = await resolvePhoneNumber(user);
  if (phone) {
    try {
      await sendWhatsAppApproval(phone, userName, user.role);
      notifications.push('whatsapp');
      console.log(`✅ Approval WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send approval WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendApprovalSMS(phone, userName, user.role);
      notifications.push('sms');
      console.log(`✅ Approval SMS sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send approval SMS to ${phone}:`, error.message);
    }
  } else if ((user.isEmailUser || user.isGoogleUser) && user.isEmailVerified && user.email) {
    try {
      await sendApprovalEmail(user.email, userName, user.role);
      notifications.push('email');
      console.log(`✅ Approval email sent to ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to send approval email to ${user.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for user ${user._id} - no verified contact methods`);
  }

  const actionPrompt = user.role === 'INNOVATOR'
    ? 'Your account has been approved. Start adding your innovations to reach VLEs and farmers!'
    : user.role === 'AO'
      ? 'Your account has been approved. Start registering VLEs under your organization!'
      : 'Your account has been approved. You can now access all platform features.';

  try {
    await Notification.create({
      recipient: user._id,
      type: 'USER_APPROVED',
      title: 'Account Approved',
      message: actionPrompt,
      entityType: 'User',
      entityId: user._id
    });
  } catch (err) {
    console.error('Failed to save in-app approval notification:', err.message);
  }

  return notifications;
};

const sendRejectionNotification = async (user, reason) => {
  const userName = user.fullName || 'User';
  const notifications = [];

  const phone = await resolvePhoneNumber(user);
  if (phone) {
    try {
      await sendWhatsAppRejection(phone, userName, reason);
      notifications.push('whatsapp');
      console.log(`✅ Rejection WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send rejection WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendRejectionSMS(phone, userName, reason);
      notifications.push('sms');
      console.log(`✅ Rejection SMS sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send rejection SMS to ${phone}:`, error.message);
    }
  } else if ((user.isEmailUser || user.isGoogleUser) && user.isEmailVerified && user.email) {
    try {
      await sendRejectionEmail(user.email, userName, reason);
      notifications.push('email');
      console.log(`✅ Rejection email sent to ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to send rejection email to ${user.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for user ${user._id} - no verified contact methods`);
  }

  try {
    await Notification.create({
      recipient: user._id,
      type: 'USER_REJECTED',
      title: 'Account Rejected',
      message: `Your account application has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      entityType: 'User',
      entityId: user._id
    });
  } catch (err) {
    console.error('Failed to save in-app rejection notification:', err.message);
  }

  return notifications;
};

module.exports = {
  sendApprovalNotification,
  sendRejectionNotification
};
