const { sendEmail } = require('../channels/email');
const { sendWhatsAppMessage } = require('../channels/whatsapp');
const { sendSMS } = require('../channels/sms');
const Notification = require('../../../models/Notification');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const sendPilotInterestNotification = async (innovator, vleUser, innovation) => {
  const innovatorName = innovator.fullName || 'User';
  const vleName = vleUser.fullName || 'A VLE';
  const innovationTitle = innovation.innovationName || 'your innovation';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const phone = await resolvePhoneNumber(innovator);
  if (phone) {
    try {
      await sendWhatsAppMessage(phone, `🌟 *New Pilot Interest - Tech Dhaara!*\n\nHi ${innovatorName},\n\n*${vleName}* has expressed interest in piloting your innovation *"${innovationTitle}"*!\n\nLogin to view the details.\n\n---\nTech Dhaara Team`);
    } catch (err) {
      console.error('Failed to send WhatsApp pilot interest notification:', err.message);
    }
    try {
      await sendSMS(phone, `Tech Dhaara: ${vleName} expressed interest in piloting your innovation "${innovationTitle}"! Login to view details.`);
    } catch (err) {
      console.error('Failed to send SMS pilot interest notification:', err.message);
    }
  } else if ((innovator.isEmailUser || innovator.isGoogleUser) && innovator.isEmailVerified && innovator.email) {
    try {
      await sendEmail(innovator.email, `New Pilot Interest in "${innovationTitle}"`, `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #28a745; margin: 0;">🌟 New Pilot Interest!</h1>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${innovatorName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              <strong>${vleName}</strong> has expressed interest in piloting your innovation <strong>"${innovationTitle}"</strong>!
            </p>
            <div style="background-color: #e8f5e9; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32;">This is a great opportunity for your innovation to reach real communities and create impact!</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/innovations/${innovation._id}" style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
                View Innovation
              </a>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Best regards,<br><strong>The Tech Dhaara Team</strong>
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #6c757d; font-size: 12px; text-align: center;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      `);
    } catch (err) {
      console.error('Failed to send pilot interest email to innovator:', err.message);
    }
  }

  try {
    await Notification.create({
      recipient: innovator._id,
      type: 'PILOT_REQUEST_RECEIVED',
      title: 'New Pilot Interest',
      message: `${vleName} expressed interest in piloting your innovation "${innovationTitle}".`,
      entityType: 'Innovation',
      entityId: innovation._id
    });
  } catch (err) {
    console.error('Failed to save pilot interest notification:', err.message);
  }
};

module.exports = { sendPilotInterestNotification };
