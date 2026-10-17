const { sendEmail } = require('../channels/email');
const { sendWhatsAppMessage } = require('../channels/whatsapp');
const { sendSMS } = require('../channels/sms');
const Notification = require('../../../models/Notification');
const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const { resolvePhoneNumber } = require('../utils/phoneResolver');

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const sendServiceRequestSubmitted = async (vleUser, serviceRequest) => {
  const vleName = vleUser.fullName || 'A VLE';
  const techName = serviceRequest.techName || 'a service';

  // Notify admin
  const admins = await User.find({
    role: { $in: ['ADMIN', 'SUPER_ADMIN'] },
    status: 'APPROVED'
  }).select('_id email isEmailUser isGoogleUser isEmailVerified').lean();

  for (const admin of admins) {
    if ((admin.isEmailUser || admin.isGoogleUser) && admin.isEmailVerified && admin.email) {
      sendEmail(admin.email, 'New Service Request Submitted - Tech Dhaara', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50;">New Service Request Submitted</h2>
            <p style="font-size: 16px; color: #333;"><strong>${vleName}</strong> has submitted a service request for <strong>"${techName}"</strong>.</p>
            <p style="margin-top: 24px;">
              <a href="${frontendUrl}/admin/service-requests" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Review Request</a>
            </p>
            <p style="font-size: 16px; color: #333; margin-top: 24px;">Best regards,<br><strong>The Tech Dhaara System</strong></p>
          </div>
        </div>
      `).catch(() => {});
    }
  }

  Notification.create({
    recipient: null,
    type: 'NEW_SERVICE_REQUEST_SUBMITTED',
    title: 'New Service Request Submitted',
    message: `${vleName} has submitted a service request for "${techName}".`,
    entityType: 'ServiceRequest',
    entityId: serviceRequest._id
  }).catch(() => {});

  // Notify AO if VLE has one
  const vleProfile = await VleProfile.findOne({ userId: vleUser._id }).select('affiliatedOrg').lean();
  if (!vleProfile || !vleProfile.affiliatedOrg) return;

  const aoUser = await User.findById(vleProfile.affiliatedOrg).lean();
  if (!aoUser) return;

  const aoName = aoUser.fullName || 'User';
  const phone = await resolvePhoneNumber(aoUser);

  if (phone) {
    sendWhatsAppMessage(phone, `📋 *New Service Request - Tech Dhaara*\n\nHi ${aoName},\n\n${vleName} has submitted a service request for *"${techName}"*.\n\n---\nTech Dhaara Team`).catch(() => {});
    sendSMS(phone, `Tech Dhaara: ${vleName} submitted a service request for "${techName}".`).catch(() => {});
  } else if ((aoUser.isEmailUser || aoUser.isGoogleUser) && aoUser.isEmailVerified && aoUser.email) {
    sendEmail(aoUser.email, 'Your VLE Submitted a Service Request - Tech Dhaara', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50;">VLE Submitted a Service Request</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${aoName},</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;"><strong>${vleName}</strong> has submitted a service request for <strong>"${techName}"</strong>.</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Best regards,<br><strong>The Tech Dhaara Team</strong></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
          <p style="color: #6c757d; font-size: 12px; text-align: center;">This is an automated email. Please do not reply.</p>
        </div>
      </div>
    `).catch(() => {});
  }

  Notification.create({
    recipient: aoUser._id,
    type: 'NEW_SERVICE_REQUEST_SUBMITTED',
    title: 'VLE Submitted a Service Request',
    message: `${vleName} submitted a service request for "${techName}".`,
    entityType: 'ServiceRequest',
    entityId: serviceRequest._id
  }).catch(() => {});
};

module.exports = { sendServiceRequestSubmitted };
