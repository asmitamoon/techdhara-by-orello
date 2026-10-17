const { sendPendingAoEmail, sendAoApprovalEmail, sendAoRejectionEmail } = require('../channels/email');
const { sendPendingAoSMS, sendAoApprovalSMS, sendAoRejectionSMS } = require('../channels/sms');
const { sendWhatsAppPendingAo, sendWhatsAppAoApproval, sendWhatsAppAoRejection } = require('../channels/whatsapp');
const Notification = require('../../../models/Notification');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const sendPendingAoNotification = async (nodalOrg, aoUser, aoProfile) => {
  const nodalOrgName = nodalOrg.fullName || 'there';
  const aoName = aoUser.fullName || 'An AO';
  const notifications = [];

  const phone = await resolvePhoneNumber(nodalOrg);
  if (phone) {
    try {
      await sendWhatsAppPendingAo(phone, nodalOrgName, aoName, aoProfile.orgName);
      notifications.push('whatsapp');
      console.log(`✅ Pending AO notification WhatsApp sent to Nodal Org ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send pending AO notification WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendPendingAoSMS(phone, aoName, aoProfile.orgName);
      notifications.push('sms');
      console.log(`✅ Pending AO notification SMS sent to Nodal Org ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send pending AO notification SMS to ${phone}:`, error.message);
    }
  } else if ((nodalOrg.isEmailUser || nodalOrg.isGoogleUser) && nodalOrg.isEmailVerified && nodalOrg.email) {
    try {
      await sendPendingAoEmail(nodalOrg.email, nodalOrgName, aoName, aoProfile);
      notifications.push('email');
      console.log(`✅ Pending AO notification email sent to Nodal Org ${nodalOrg.email}`);
    } catch (error) {
      console.error(`❌ Failed to send pending AO notification email to ${nodalOrg.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for Nodal Org ${nodalOrg._id} - no verified contact methods`);
  }

  try {
    await Notification.create({
      recipient: nodalOrg._id,
      type: 'AO_PENDING',
      title: 'New AO Registration Request',
      message: `${aoName} from ${aoProfile.orgName} is awaiting your approval.`,
      entityType: 'User',
      entityId: aoUser._id
    });
  } catch (err) {
    console.error('Failed to save in-app AO pending notification:', err.message);
  }

  return notifications;
};

const sendAoApprovalNotification = async (aoUser, nodalOrg) => {
  const aoName = aoUser.fullName || 'there';
  const nodalOrgName = nodalOrg.fullName || 'Your Nodal Organization';
  const notifications = [];

  const phone = await resolvePhoneNumber(aoUser);
  if (phone) {
    try {
      await sendWhatsAppAoApproval(phone, aoName, nodalOrgName);
      notifications.push('whatsapp');
      console.log(`✅ AO approval notification WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send AO approval notification WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendAoApprovalSMS(phone, aoName, nodalOrgName);
      notifications.push('sms');
      console.log(`✅ AO approval notification SMS sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send AO approval notification SMS to ${phone}:`, error.message);
    }
  } else if ((aoUser.isEmailUser || aoUser.isGoogleUser) && aoUser.isEmailVerified && aoUser.email) {
    try {
      await sendAoApprovalEmail(aoUser.email, aoName, nodalOrgName);
      notifications.push('email');
      console.log(`✅ AO approval notification email sent to ${aoUser.email}`);
    } catch (error) {
      console.error(`❌ Failed to send AO approval notification email to ${aoUser.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for AO ${aoUser._id} - no verified contact methods`);
  }

  try {
    await Notification.create({
      recipient: aoUser._id,
      type: 'AO_APPROVED',
      title: 'AO Registration Approved',
      message: `Your AO registration has been approved by ${nodalOrgName}. You can now access all platform features.`,
      entityType: 'User',
      entityId: aoUser._id
    });
  } catch (err) {
    console.error('Failed to save in-app AO approval notification:', err.message);
  }

  return notifications;
};

const sendAoRejectionNotification = async (aoUser, nodalOrg, reason) => {
  const aoName = aoUser.fullName || 'there';
  const nodalOrgName = nodalOrg.fullName || 'Your Nodal Organization';
  const notifications = [];

  const phone = await resolvePhoneNumber(aoUser);
  if (phone) {
    try {
      await sendWhatsAppAoRejection(phone, aoName, nodalOrgName, reason);
      notifications.push('whatsapp');
      console.log(`✅ AO rejection notification WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send AO rejection notification WhatsApp to ${phone}:`, error.message);
    }
    try {
      await sendAoRejectionSMS(phone, aoName, nodalOrgName, reason);
      notifications.push('sms');
      console.log(`✅ AO rejection notification SMS sent to ${phone}`);
    } catch (error) {
      console.error(`❌ Failed to send AO rejection notification SMS to ${phone}:`, error.message);
    }
  } else if ((aoUser.isEmailUser || aoUser.isGoogleUser) && aoUser.isEmailVerified && aoUser.email) {
    try {
      await sendAoRejectionEmail(aoUser.email, aoName, nodalOrgName, reason);
      notifications.push('email');
      console.log(`✅ AO rejection notification email sent to ${aoUser.email}`);
    } catch (error) {
      console.error(`❌ Failed to send AO rejection notification email to ${aoUser.email}:`, error.message);
    }
  }

  if (notifications.length === 0) {
    console.warn(`⚠️  No notifications sent for AO ${aoUser._id} - no verified contact methods`);
  }

  try {
    await Notification.create({
      recipient: aoUser._id,
      type: 'AO_REJECTED',
      title: 'AO Registration Not Approved',
      message: reason || `Your AO registration was not approved by ${nodalOrgName}.`,
      entityType: 'User',
      entityId: aoUser._id
    });
  } catch (err) {
    console.error('Failed to save in-app AO rejection notification:', err.message);
  }

  return notifications;
};

module.exports = {
  sendPendingAoNotification,
  sendAoApprovalNotification,
  sendAoRejectionNotification
};
