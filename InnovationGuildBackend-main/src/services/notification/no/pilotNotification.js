const { sendEmail } = require('../channels/email');
const { sendWhatsAppMessage } = require('../channels/whatsapp');
const { sendSMS } = require('../channels/sms');
const Notification = require('../../../models/Notification');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const sendPilotRequestToNo = async (noUser, vleUser, aoUser, innovation) => {
  const noName = noUser.fullName || 'User';
  const vleName = vleUser.fullName || 'A VLE';
  const aoName = aoUser?.fullName || 'an Affiliated Organization';
  const innovationTitle = innovation.innovationName || 'an innovation';

  const phone = await resolvePhoneNumber(noUser);
  if (phone) {
    try {
      await sendWhatsAppMessage(phone, `🚀 *VLE Pilot Request - Tech Dhaara*\n\nHi ${noName},\n\n${vleName} (under ${aoName}) has submitted a pilot request for the innovation *"${innovationTitle}"*.\n\n---\nTech Dhaara Team`);
    } catch (err) {
      console.error('Failed to send WhatsApp pilot request notification to NO:', err.message);
    }
    try {
      await sendSMS(phone, `Tech Dhaara: ${vleName} (under ${aoName}) submitted a pilot request for "${innovationTitle}".`);
    } catch (err) {
      console.error('Failed to send SMS pilot request notification to NO:', err.message);
    }
  } else if ((noUser.isEmailUser || noUser.isGoogleUser) && noUser.isEmailVerified && noUser.email) {
    try {
      await sendEmail(noUser.email, `VLE Pilot Request Under Your Network - "${innovationTitle}"`, `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50;">Pilot Request in Your Network</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${noName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              <strong>${vleName}</strong> (under <strong>${aoName}</strong>) has submitted a pilot request for the innovation <strong>"${innovationTitle}"</strong>.
            </p>
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
      console.error('Failed to send pilot request email to NO:', err.message);
    }
  }

  try {
    await Notification.create({
      recipient: noUser._id,
      type: 'VLE_PILOT_REQUEST',
      title: 'Pilot Request in Your Network',
      message: `${vleName} (under ${aoName}) submitted a pilot request for "${innovationTitle}".`,
      entityType: 'Innovation',
      entityId: innovation._id
    });
  } catch (err) {
    console.error('Failed to save pilot request notification for NO:', err.message);
  }
};

module.exports = { sendPilotRequestToNo };
