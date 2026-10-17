const { sendEmail } = require('../channels/email');
const { sendWhatsAppMessage } = require('../channels/whatsapp');
const { sendSMS } = require('../channels/sms');
const Notification = require('../../../models/Notification');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const sendRegistrationConfirmation = async (user) => {
  const userName = user.fullName || 'User';

  const phone = await resolvePhoneNumber(user);
  if (phone) {
    try {
      await sendWhatsAppMessage(phone, `✅ *Registration Received - Tech Dhaara*\n\nHi ${userName},\n\nYour registration has been received successfully. Our team will review your profile and notify you once a decision has been made.\n\n---\nTech Dhaara Team`);
    } catch (err) {
      console.error('Failed to send WhatsApp registration confirmation:', err.message);
    }
    try {
      await sendSMS(phone, `Tech Dhaara: Hi ${userName}, your registration has been received! Our team will review your profile and notify you shortly.`);
    } catch (err) {
      console.error('Failed to send SMS registration confirmation:', err.message);
    }
  } else if ((user.isEmailUser || user.isGoogleUser) && user.isEmailVerified && user.email) {
    try {
      await sendEmail(user.email, 'Registration Received - Tech Dhaara', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #123E39;">Registration Received!</h2>
            <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
              Your registration on the Tech Dhaara platform has been received successfully.
            </p>
            <div style="background-color: #ECE8DE; padding: 20px; border-left: 4px solid #123E39; margin: 20px 0;">
              <p style="margin: 0; color: #123E39;">Our team will review your profile and notify you once a decision has been made.</p>
            </div>
            <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
              Best regards,<br><strong>The Tech Dhaara Team</strong>
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">
            <p style="color: #666666; font-size: 12px; text-align: center;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      `);
    } catch (err) {
      console.error('Failed to send registration confirmation email:', err.message);
    }
  }

  try {
    await Notification.create({
      recipient: user._id,
      type: 'REGISTRATION_RECEIVED',
      title: 'Registration Received',
      message: 'Your registration has been received. Our team will review your profile and notify you shortly.',
      entityType: 'User',
      entityId: user._id
    });
  } catch (err) {
    console.error('Failed to save in-app registration notification:', err.message);
  }
};

module.exports = { sendRegistrationConfirmation };
