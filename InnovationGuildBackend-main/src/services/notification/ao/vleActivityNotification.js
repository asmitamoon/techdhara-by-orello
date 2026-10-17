const { sendEmail } = require('../channels/email');
const { sendWhatsAppMessage } = require('../channels/whatsapp');
const { sendSMS } = require('../channels/sms');
const Notification = require('../../../models/Notification');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const sendVleRegisteredConfirmation = async (aoUser, vleUser) => {
  const aoName = aoUser.fullName || 'User';
  const vleName = vleUser.fullName || 'VLE';

  const phone = await resolvePhoneNumber(aoUser);
  if (phone) {
    try {
      await sendWhatsAppMessage(phone, `✅ *VLE Registered Successfully - Tech Dhaara*\n\nHi ${aoName},\n\n${vleName} has been successfully registered as a VLE under your organization.\n\n---\nTech Dhaara Team`);
    } catch (err) {
      console.error('Failed to send WhatsApp VLE registered confirmation to AO:', err.message);
    }
    try {
      await sendSMS(phone, `Tech Dhaara: ${vleName} has been successfully registered as a VLE under your organization.`);
    } catch (err) {
      console.error('Failed to send SMS VLE registered confirmation to AO:', err.message);
    }
  } else if ((aoUser.isEmailUser || aoUser.isGoogleUser) && aoUser.isEmailVerified && aoUser.email) {
    try {
      await sendEmail(aoUser.email, 'VLE Registered Successfully - Tech Dhaara', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50;">VLE Registered Successfully!</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${aoName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              <strong>${vleName}</strong> has been successfully registered as a VLE under your organization on the Tech Dhaara platform.
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
      console.error('Failed to send VLE registered confirmation email to AO:', err.message);
    }
  }

  try {
    await Notification.create({
      recipient: aoUser._id,
      type: 'VLE_REGISTERED_CONFIRMED',
      title: 'VLE Registered Successfully',
      message: `${vleName} has been successfully registered as a VLE under your organization.`,
      entityType: 'User',
      entityId: vleUser._id
    });
  } catch (err) {
    console.error('Failed to save VLE registered confirmation notification:', err.message);
  }
};

const sendVleSubmittedProblem = async (aoUser, problem, vleUser) => {
  const aoName = aoUser.fullName || 'User';
  const vleName = vleUser.fullName || 'Your VLE';
  const problemTitle = problem.problemTitle || 'a problem';

  const phone = await resolvePhoneNumber(aoUser);
  if (phone) {
    try {
      await sendWhatsAppMessage(phone, `📋 *VLE Submitted a Problem Statement*\n\nHi ${aoName},\n\n${vleName} has submitted a problem statement *"${problemTitle}"* for approval.\n\n---\nTech Dhaara Team`);
    } catch (err) {
      console.error('Failed to send WhatsApp VLE submitted problem notification to AO:', err.message);
    }
    try {
      await sendSMS(phone, `Tech Dhaara: ${vleName} submitted problem "${problemTitle}" for approval.`);
    } catch (err) {
      console.error('Failed to send SMS VLE submitted problem notification to AO:', err.message);
    }
  } else if ((aoUser.isEmailUser || aoUser.isGoogleUser) && aoUser.isEmailVerified && aoUser.email) {
    try {
      await sendEmail(aoUser.email, 'Your VLE Submitted a Problem Statement', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50;">VLE Submitted a Problem Statement</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${aoName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              <strong>${vleName}</strong> has submitted a problem statement <strong>"${problemTitle}"</strong> for approval.
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
      console.error('Failed to send VLE submitted problem email to AO:', err.message);
    }
  }

  try {
    await Notification.create({
      recipient: aoUser._id,
      type: 'VLE_SUBMITTED_PROBLEM',
      title: 'VLE Submitted a Problem',
      message: `${vleName} submitted problem "${problemTitle}" for approval.`,
      entityType: 'InnovationRequest',
      entityId: problem._id
    });
  } catch (err) {
    console.error('Failed to save VLE submitted problem notification:', err.message);
  }
};

const sendVlePilotRequest = async (aoUser, vleUser, innovation) => {
  const aoName = aoUser.fullName || 'User';
  const vleName = vleUser.fullName || 'A VLE';
  const innovationTitle = innovation.innovationName || 'an innovation';

  const phone = await resolvePhoneNumber(aoUser);
  if (phone) {
    try {
      await sendWhatsAppMessage(phone, `🚀 *VLE Pilot Request - Tech Dhaara*\n\nHi ${aoName},\n\n${vleName} has submitted a pilot request for the innovation *"${innovationTitle}"*. Login to review.\n\n---\nTech Dhaara Team`);
    } catch (err) {
      console.error('Failed to send WhatsApp pilot request notification to AO:', err.message);
    }
    try {
      await sendSMS(phone, `Tech Dhaara: ${vleName} submitted a pilot request for "${innovationTitle}". Login to review.`);
    } catch (err) {
      console.error('Failed to send SMS pilot request notification to AO:', err.message);
    }
  } else if ((aoUser.isEmailUser || aoUser.isGoogleUser) && aoUser.isEmailVerified && aoUser.email) {
    try {
      await sendEmail(aoUser.email, `VLE Pilot Request - "${innovationTitle}"`, `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50;">VLE Submitted a Pilot Request</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${aoName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              <strong>${vleName}</strong> has submitted a pilot request for the innovation <strong>"${innovationTitle}"</strong>.
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
      console.error('Failed to send pilot request email to AO:', err.message);
    }
  }

  try {
    await Notification.create({
      recipient: aoUser._id,
      type: 'VLE_PILOT_REQUEST',
      title: 'VLE Submitted a Pilot Request',
      message: `${vleName} submitted a pilot request for "${innovationTitle}".`,
      entityType: 'Innovation',
      entityId: innovation._id
    });
  } catch (err) {
    console.error('Failed to save pilot request notification for AO:', err.message);
  }
};

module.exports = { sendVleRegisteredConfirmation, sendVleSubmittedProblem, sendVlePilotRequest };
