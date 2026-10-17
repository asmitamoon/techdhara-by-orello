const { sendRequestEditEmail } = require('../channels/email');
const { sendWhatsAppRequestEdit } = require('../channels/whatsapp');
const { sendRequestEditSMS } = require('../channels/sms');
const Notification = require('../../../models/Notification');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const sendRequestEditNotification = async (user, reason, contentType, contentTitle) => {
  const userName = user.fullName || 'User';
  const notifications = [];

  const phone = await resolvePhoneNumber(user);
  if (phone) {
    try {
      await sendWhatsAppRequestEdit(phone, userName, reason, contentType, contentTitle);
      notifications.push('whatsapp');
      console.log(`✅ Request edit WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send request edit WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendRequestEditSMS(phone, userName, reason, contentType, contentTitle);
      notifications.push('sms');
      console.log(`✅ Request edit SMS sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send request edit SMS to ${phone}:`, error.message);
    }
  } else if ((user.isEmailUser || user.isGoogleUser) && user.isEmailVerified && user.email) {
    try {
      await sendRequestEditEmail(user.email, userName, reason, contentType, contentTitle);
      notifications.push('email');
      console.log(`✅ Request edit email sent to ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to send request edit email to ${user.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for edit request to user ${user._id} - no verified contact methods`);
  }

  try {
    await Notification.create({
      recipient: user._id,
      type: 'EDIT_REQUESTED',
      title: 'Edit Requested',
      message: contentTitle
        ? `Please make edits to your ${contentType} "${contentTitle}": ${reason}`
        : `Please make edits to your ${contentType}: ${reason}`,
      entityType: 'User',
      entityId: user._id
    });
  } catch (err) {
    console.error('Failed to save in-app edit request notification:', err.message);
  }

  return notifications;
};

module.exports = { sendRequestEditNotification };
