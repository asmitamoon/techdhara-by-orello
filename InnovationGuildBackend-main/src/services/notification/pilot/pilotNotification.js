const { sendEmail } = require('../channels/email');
const { sendWhatsAppMessage } = require('../channels/whatsapp');
const { sendSMS } = require('../channels/sms');
const Notification = require('../../../models/Notification');
const User = require('../../../models/User');
const Innovation = require('../../../models/Innovation');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const STATUS_TITLES = {
  PILOT_STARTED: 'Pilot Started',
  TRIAL_STARTED: 'Trial Phase Started',
  IMPLEMENTED: 'Pilot Implemented',
  CANCELLED: 'Pilot Cancelled'
};

const buildStatusMessages = (newStatus, innovationName) => {
  const n = innovationName ? `"${innovationName}"` : 'your innovation';
  switch (newStatus) {
    case 'PILOT_STARTED':
      return {
        vleMsg: `Your pilot for innovation ${n} has been approved and is now in progress.`,
        innovatorMsg: `A pilot for your innovation ${n} has been started.`
      };
    case 'TRIAL_STARTED':
      return {
        vleMsg: `Your pilot for innovation ${n} has entered the trial phase.`,
        innovatorMsg: `A pilot for your innovation ${n} has entered the trial phase.`
      };
    case 'IMPLEMENTED':
      return {
        vleMsg: `Congratulations! Your pilot for innovation ${n} has been successfully implemented.`,
        innovatorMsg: `Congratulations! A pilot for your innovation ${n} has been successfully implemented.`
      };
    case 'CANCELLED':
      return {
        vleMsg: `Your pilot for innovation ${n} has been cancelled.`,
        innovatorMsg: `A pilot for your innovation ${n} has been cancelled.`
      };
    default:
      return { vleMsg: '', innovatorMsg: '' };
  }
};

const notifyPilotUser = async (user, title, message, notifType, pilotId) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const phone = await resolvePhoneNumber(user);
  if (phone) {
    sendWhatsAppMessage(phone, `🔔 *${title} - Tech Dhaara*\n\nHi ${user.fullName || 'User'},\n\n${message}\n\nLogin to view: ${frontendUrl}\n\n---\nTech Dhaara Team`).catch(() => {});
    sendSMS(phone, `Tech Dhaara: ${message}`).catch(() => {});
  } else if ((user.isEmailUser || user.isGoogleUser) && user.isEmailVerified && user.email) {
    sendEmail(user.email, `${title} - Tech Dhaara`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50;">${title}</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${user.fullName || 'User'},</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">${message}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}" style="display: inline-block; background-color: #2196F3; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">Visit Platform</a>
          </div>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Best regards,<br><strong>The Tech Dhaara Team</strong></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
          <p style="color: #6c757d; font-size: 12px; text-align: center;">This is an automated email. Please do not reply.</p>
        </div>
      </div>
    `).catch(() => {});
  }

  Notification.create({
    recipient: user._id,
    type: notifType,
    title,
    message,
    entityType: 'Pilot',
    entityId: pilotId
  }).catch(() => {});
};

const sendPilotStatusChanged = async (pilot, newStatus) => {
  const title = STATUS_TITLES[newStatus];
  if (!title) return;

  const notifType = newStatus === 'IMPLEMENTED' ? 'PILOT_IMPLEMENTED' : 'PILOT_STATUS_CHANGED';

  const [vleUser, innovation] = await Promise.all([
    User.findById(pilot.vleId).lean(),
    Innovation.findById(pilot.innovationId).select('innovatorId innovationName').lean()
  ]);

  const { vleMsg, innovatorMsg } = buildStatusMessages(newStatus, innovation?.innovationName);

  if (vleUser) {
    await notifyPilotUser(vleUser, title, vleMsg, notifType, pilot._id);
  }

  if (innovation) {
    const innovatorUser = await User.findById(innovation.innovatorId).lean();
    if (innovatorUser) {
      await notifyPilotUser(innovatorUser, title, innovatorMsg, notifType, pilot._id);
    }
  }
};

module.exports = { sendPilotStatusChanged };
