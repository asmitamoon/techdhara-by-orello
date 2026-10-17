const { sendEmail } = require('../channels/email');
const { sendWhatsAppMessage } = require('../channels/whatsapp');
const { sendSMS } = require('../channels/sms');
const Notification = require('../../../models/Notification');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const sendVleRegisteredByAo = async (vleUser, aoUser) => {
  const vleName = vleUser.fullName || 'User';
  const aoName = aoUser.fullName || 'your organization';

  const phone = await resolvePhoneNumber(vleUser);
  if (phone) {
    try {
      await sendWhatsAppMessage(phone, `🎉 *Welcome to Tech Dhaara!*\n\nHi ${vleName},\n\nYou have been registered as a VLE on the Tech Dhaara platform by *${aoName}*.\n\nExplore innovations and connect with your community!\n\n---\nTech Dhaara Team`);
    } catch (err) {
      console.error('Failed to send WhatsApp VLE registered by AO notification:', err.message);
    }
    try {
      await sendSMS(phone, `Tech Dhaara: Welcome ${vleName}! You have been registered as a VLE by ${aoName}. Login to explore the platform.`);
    } catch (err) {
      console.error('Failed to send SMS VLE registered by AO notification:', err.message);
    }
  } else if ((vleUser.isEmailUser || vleUser.isGoogleUser) && vleUser.isEmailVerified && vleUser.email) {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      await sendEmail(vleUser.email, 'Welcome to Tech Dhaara!', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #28a745;">Welcome to Tech Dhaara!</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${vleName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              You have been registered as a VLE (Village Level Entrepreneur) on the Tech Dhaara platform by <strong>${aoName}</strong>.
            </p>
            <div style="background-color: #e8f5e9; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32; font-weight: bold;">You can now:</p>
              <ul style="color: #2e7d32; margin: 10px 0;">
                <li>Explore agricultural innovations</li>
                <li>Submit problem statements</li>
                <li>Connect with innovators and entrepreneurs</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/login" style="display: inline-block; background-color: #28a745; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Login to Your Account
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
      console.error('Failed to send VLE registered by AO email:', err.message);
    }
  }

  try {
    await Notification.create({
      recipient: vleUser._id,
      type: 'VLE_REGISTERED_BY_AO',
      title: 'Registered on Tech Dhaara',
      message: `You have been registered as a VLE on the Tech Dhaara platform by ${aoName}.`,
      entityType: 'User',
      entityId: vleUser._id
    });
  } catch (err) {
    console.error('Failed to save VLE registered by AO notification:', err.message);
  }
};

const sendProblemCreatedForVle = async (vleUser, problem, aoUser) => {
  const vleName = vleUser.fullName || 'User';
  const aoName = aoUser.fullName || 'Your organization';
  const problemTitle = problem.problemTitle || 'a problem';

  const phone = await resolvePhoneNumber(vleUser);
  if (phone) {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      await sendWhatsAppMessage(phone, `📋 *Problem Created on Your Behalf*\n\nHi ${vleName},\n\n*${aoName}* has created a problem statement *"${problemTitle}"* on your behalf on the Tech Dhaara platform.\n\nView it here: ${frontendUrl}/my-problem-statements\n\n---\nTech Dhaara Team`);
    } catch (err) {
      console.error('Failed to send WhatsApp problem created for VLE notification:', err.message);
    }
    try {
      await sendSMS(phone, `Tech Dhaara: ${aoName} created problem "${problemTitle}" on your behalf. Login to view it.`);
    } catch (err) {
      console.error('Failed to send SMS problem created for VLE notification:', err.message);
    }
  } else if ((vleUser.isEmailUser || vleUser.isGoogleUser) && vleUser.isEmailVerified && vleUser.email) {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      await sendEmail(vleUser.email, 'Problem Statement Created on Your Behalf', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50;">Problem Statement Created for You</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${vleName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              <strong>${aoName}</strong> has created a problem statement <strong>"${problemTitle}"</strong> on your behalf on the Tech Dhaara platform.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/my-problem-statements" style="display: inline-block; background-color: #2196F3; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
                View Problem Statements
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
      console.error('Failed to send problem created for VLE email:', err.message);
    }
  }

  try {
    await Notification.create({
      recipient: vleUser._id,
      type: 'PROBLEM_CREATED_FOR_VLE',
      title: 'Problem Created on Your Behalf',
      message: `${aoName} created problem "${problemTitle}" on your behalf.`,
      entityType: 'InnovationRequest',
      entityId: problem._id
    });
  } catch (err) {
    console.error('Failed to save problem created for VLE notification:', err.message);
  }
};

module.exports = { sendVleRegisteredByAo, sendProblemCreatedForVle };
