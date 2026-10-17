const { sendEmail } = require('../channels/email');
const Notification = require('../../../models/Notification');
const User = require('../../../models/User');

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const sendFieldReportSubmittedToAdmin = async (aoUser, fieldReport) => {
  const aoName = aoUser.fullName || 'An AO';

  const admins = await User.find({
    role: { $in: ['ADMIN', 'SUPER_ADMIN'] },
    status: 'APPROVED'
  }).select('_id email isEmailUser isGoogleUser isEmailVerified').lean();

  for (const admin of admins) {
    if ((admin.isEmailUser || admin.isGoogleUser) && admin.isEmailVerified && admin.email) {
      sendEmail(admin.email, 'New Field Report Submitted - Tech Dhaara', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #123E39;">New Field Report Submitted</h2>
            <p style="font-size: 16px; color: #3D3D3D;"><strong>${aoName}</strong> has submitted a new field report.</p>
            <p style="margin-top: 24px;">
              <a href="${frontendUrl}/admin/field-reports" style="background:#A54025;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">View Field Report</a>
            </p>
            <p style="font-size: 16px; color: #3D3D3D; margin-top: 24px;">Best regards,<br><strong>The Tech Dhaara System</strong></p>
          </div>
        </div>
      `).catch(() => {});
    }
  }

  Notification.create({
    recipient: null,
    type: 'FIELD_REPORT_SUBMITTED',
    title: 'New Field Report Submitted',
    message: `${aoName} has submitted a new field report.`,
    entityType: 'FieldReport',
    entityId: fieldReport._id
  }).catch(() => {});
};

module.exports = { sendFieldReportSubmittedToAdmin };
