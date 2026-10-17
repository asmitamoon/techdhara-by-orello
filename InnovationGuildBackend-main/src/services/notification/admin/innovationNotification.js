const { sendEmail } = require('../channels/email');
const Notification = require('../../../models/Notification');
const User = require('../../../models/User');

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const sendInnovationSubmittedToAdmin = async (innovatorUser, innovation) => {
  const innovatorName = innovatorUser.fullName || 'An innovator';
  const innovationName = innovation.innovationName || 'an innovation';

  const admins = await User.find({
    role: { $in: ['ADMIN', 'SUPER_ADMIN'] },
    status: 'APPROVED'
  }).select('_id email isEmailUser isGoogleUser isEmailVerified').lean();

  for (const admin of admins) {
    if ((admin.isEmailUser || admin.isGoogleUser) && admin.isEmailVerified && admin.email) {
      sendEmail(admin.email, 'New Innovation Submitted for Approval - Tech Dhaara', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #123E39;">New Innovation Submitted for Approval</h2>
            <p style="font-size: 16px; color: #3D3D3D;"><strong>${innovatorName}</strong> has submitted <strong>"${innovationName}"</strong> for approval.</p>
            <p style="margin-top: 24px;">
              <a href="${frontendUrl}/admin/innovations" style="background:#A54025;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Review Innovation</a>
            </p>
            <p style="font-size: 16px; color: #3D3D3D; margin-top: 24px;">Best regards,<br><strong>The Tech Dhaara System</strong></p>
          </div>
        </div>
      `).catch(() => {});
    }
  }

  Notification.create({
    recipient: null,
    type: 'NEW_INNOVATION_SUBMITTED',
    title: 'New Innovation Submitted for Approval',
    message: `${innovatorName} has submitted "${innovationName}" for approval.`,
    entityType: 'Innovation',
    entityId: innovation._id
  }).catch(() => {});
};

module.exports = { sendInnovationSubmittedToAdmin };
