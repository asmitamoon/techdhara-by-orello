const { sendEmail } = require('../channels/email');
const Notification = require('../../../models/Notification');
const User = require('../../../models/User');

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const sendNewUserRegisteredToAdmin = async (user) => {
  const userName = user.fullName || 'A new user';
  const userRole = user.role;
  const userContact = user.email || user.phone || '';

  const admins = await User.find({
    role: { $in: ['ADMIN', 'SUPER_ADMIN'] },
    status: 'APPROVED'
  }).select('_id email isEmailUser isGoogleUser isEmailVerified').lean();

  for (const admin of admins) {
    if ((admin.isEmailUser || admin.isGoogleUser) && admin.isEmailVerified && admin.email) {
      sendEmail(admin.email, `New ${userRole} Registration - Tech Dhaara`, `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #123E39;">New ${userRole} Registration</h2>
            <p style="font-size: 16px; color: #3D3D3D;">A new ${userRole} has completed registration and is awaiting your approval.</p>
            <p style="font-size: 16px; color: #3D3D3D;"><strong>Name:</strong> ${userName}</p>
            <p style="font-size: 16px; color: #3D3D3D;"><strong>Contact:</strong> ${userContact}</p>
            <p style="margin-top: 24px;">
              <a href="${frontendUrl}/admin/users" style="background:#A54025;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Review Registration</a>
            </p>
            <p style="font-size: 16px; color: #3D3D3D; margin-top: 24px;">Best regards,<br><strong>The Tech Dhaara System</strong></p>
          </div>
        </div>
      `).catch(() => {});
    }
  }

  Notification.create({
    recipient: null,
    type: 'NEW_USER_REGISTERED',
    title: `New ${userRole} Registration`,
    message: `${userName} has registered as a ${userRole} and is awaiting approval.`,
    entityType: 'User',
    entityId: user._id
  }).catch(() => {});
};

const sendNewNodalOrgRegisteredToAdmin = async (user, profile) => {
  const orgName = profile.orgName || user.fullName || 'A new organization';

  const admins = await User.find({
    role: { $in: ['ADMIN', 'SUPER_ADMIN'] },
    status: 'APPROVED'
  }).select('_id email isEmailUser isGoogleUser isEmailVerified').lean();

  for (const admin of admins) {
    if ((admin.isEmailUser || admin.isGoogleUser) && admin.isEmailVerified && admin.email) {
      sendEmail(admin.email, 'New Nodal Organization Registration - Tech Dhaara', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #123E39;">New Nodal Organization Registration</h2>
            <p style="font-size: 16px; color: #3D3D3D;">A new Nodal Organization has completed registration and is awaiting your approval.</p>
            <p style="font-size: 16px; color: #3D3D3D;"><strong>Organization:</strong> ${orgName}</p>
            <p style="font-size: 16px; color: #3D3D3D;"><strong>Type:</strong> ${profile.orgType || 'N/A'}</p>
            <p style="font-size: 16px; color: #3D3D3D;"><strong>HQ State:</strong> ${profile.hqState || 'N/A'}</p>
            <p style="margin-top: 24px;">
              <a href="${frontendUrl}/admin/users" style="background:#A54025;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Review Registration</a>
            </p>
            <p style="font-size: 16px; color: #3D3D3D; margin-top: 24px;">Best regards,<br><strong>The Tech Dhaara System</strong></p>
          </div>
        </div>
      `).catch(() => {});
    }
  }

  Notification.create({
    recipient: null,
    type: 'NEW_NODAL_ORG_REGISTERED',
    title: 'New Nodal Organization Registration',
    message: `${orgName} has registered as a Nodal Organization and is awaiting approval.`,
    entityType: 'User',
    entityId: user._id
  }).catch(() => {});
};

module.exports = { sendNewUserRegisteredToAdmin, sendNewNodalOrgRegisteredToAdmin };
