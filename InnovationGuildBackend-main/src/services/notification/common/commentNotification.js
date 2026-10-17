const { sendInnovationCommentEmail, sendProblemCommentEmail } = require('../channels/email');
const { sendWhatsAppInnovationComment, sendWhatsAppProblemComment } = require('../channels/whatsapp');
const { sendCommentSMS } = require('../channels/sms');
const Notification = require('../../../models/Notification');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const sendInnovationCommentNotification = async (innovation, owner, commenter, commentContent) => {
  const ownerName = owner.fullName || 'User';
  const commenterName = commenter.fullName || 'Someone';

  const truncatedComment = commentContent.length > 150
    ? commentContent.substring(0, 150) + '...'
    : commentContent;

  const notifications = [];

  const phone = await resolvePhoneNumber(owner);
  if (phone) {
    try {
      await sendWhatsAppInnovationComment(phone, ownerName, commenterName, innovation.innovationName, truncatedComment);
      notifications.push('whatsapp');
      console.log(`WhatsApp innovation comment notification sent to ${phone}`);
    } catch (error) {
      console.error('Failed to send WhatsApp innovation comment notification:', error.message);
    }
    try {
      await sendCommentSMS(phone, ownerName, commenterName, innovation.innovationName, 'innovation');
      notifications.push('sms');
      console.log(`SMS innovation comment notification sent to ${phone}`);
    } catch (error) {
      console.error('Failed to send SMS innovation comment notification:', error.message);
    }
  } else if ((owner.isEmailUser || owner.isGoogleUser) && owner.isEmailVerified && owner.email) {
    try {
      await sendInnovationCommentEmail(owner.email, ownerName, commenterName, innovation.innovationName, innovation._id.toString(), truncatedComment);
      notifications.push('email');
      console.log(`Email innovation comment notification sent to ${owner.email}`);
    } catch (error) {
      console.error('Failed to send email innovation comment notification:', error.message);
    }
  }

  try {
    await Notification.create({
      recipient: owner._id,
      type: 'COMMENT_RECEIVED',
      title: 'New Comment on Your Innovation',
      message: `${commenterName} commented on your innovation "${innovation.innovationName}".`,
      entityType: 'Innovation',
      entityId: innovation._id
    });
  } catch (err) {
    console.error('Failed to save in-app innovation comment notification:', err.message);
  }

  return notifications;
};

const sendProblemCommentNotification = async (problem, owner, commenter, commentContent) => {
  const ownerName = owner.fullName || 'User';
  const commenterName = commenter.fullName || 'Someone';

  const truncatedComment = commentContent.length > 150
    ? commentContent.substring(0, 150) + '...'
    : commentContent;

  const notifications = [];

  const phone = await resolvePhoneNumber(owner);
  if (phone) {
    try {
      await sendWhatsAppProblemComment(phone, ownerName, commenterName, problem.problemTitle, truncatedComment);
      notifications.push('whatsapp');
      console.log(`WhatsApp problem comment notification sent to ${phone}`);
    } catch (error) {
      console.error('Failed to send WhatsApp problem comment notification:', error.message);
    }
    try {
      await sendCommentSMS(phone, ownerName, commenterName, problem.problemTitle, 'problem');
      notifications.push('sms');
      console.log(`SMS problem comment notification sent to ${phone}`);
    } catch (error) {
      console.error('Failed to send SMS problem comment notification:', error.message);
    }
  } else if ((owner.isEmailUser || owner.isGoogleUser) && owner.isEmailVerified && owner.email) {
    try {
      await sendProblemCommentEmail(owner.email, ownerName, commenterName, problem.problemTitle, problem._id.toString(), truncatedComment);
      notifications.push('email');
      console.log(`Email problem comment notification sent to ${owner.email}`);
    } catch (error) {
      console.error('Failed to send email problem comment notification:', error.message);
    }
  }

  try {
    await Notification.create({
      recipient: owner._id,
      type: 'COMMENT_RECEIVED',
      title: 'New Comment on Your Problem',
      message: `${commenterName} commented on your problem "${problem.problemTitle}".`,
      entityType: 'Problem',
      entityId: problem._id
    });
  } catch (err) {
    console.error('Failed to save in-app problem comment notification:', err.message);
  }

  return notifications;
};

module.exports = {
  sendInnovationCommentNotification,
  sendProblemCommentNotification
};
