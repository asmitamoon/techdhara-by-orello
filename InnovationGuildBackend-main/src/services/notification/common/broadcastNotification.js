const { sendEmail } = require('../channels/email');
const { sendWhatsAppMessage } = require('../channels/whatsapp');
const Notification = require('../../../models/Notification');
const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');

const broadcastNewInnovationPublished = async (innovation, innovator) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const innovationTitle = innovation.innovationName || 'a new innovation';
  const innovatorName = innovator.fullName || 'An Innovator';

  const recipients = await User.find({
    role: { $in: ['VLE', 'AO'] },
    status: 'APPROVED'
  }).select('_id fullName email phone role isEmailUser isPhoneUser isEmailVerified isPhoneVerified isGoogleUser');

  // Batch-fetch VLE profile mobiles for non-phone-user VLEs
  const vleIds = recipients
    .filter(r => r.role === 'VLE' && !(r.isPhoneUser && r.isPhoneVerified && r.phone))
    .map(r => r._id);
  const vleProfiles = vleIds.length
    ? await VleProfile.find({ userId: { $in: vleIds } }).select('userId mobile').lean()
    : [];
  const vleMobileMap = new Map(vleProfiles.map(p => [p.userId.toString(), p.mobile]));

  for (const recipient of recipients) {
    const name = recipient.fullName || 'User';
    const phone = (recipient.isPhoneUser && recipient.isPhoneVerified && recipient.phone)
      ? recipient.phone
      : vleMobileMap.get(recipient._id.toString()) || null;

    if (phone) {
      sendWhatsAppMessage(phone, `🚀 *New Innovation on Tech Dhaara!*\n\nHi ${name},\n\n${innovatorName} just published a new innovation: *"${innovationTitle}"*\n\nLogin to explore it!\n\n---\nTech Dhaara Team`).catch(() => {});
    } else if ((recipient.isEmailUser || recipient.isGoogleUser) && recipient.isEmailVerified && recipient.email) {
      sendEmail(recipient.email, `New Innovation Published: "${innovationTitle}"`, `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #123E39;">New Innovation Published!</h2>
          <p>Hi ${name},</p>
          <p>A new innovation <strong>"${innovationTitle}"</strong> by ${innovatorName} has been published on the Tech Dhaara platform.</p>
          <p><a href="${frontendUrl}/innovations/${innovation._id}" style="background:#A54025;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">View Innovation</a></p>
          <p>Best regards,<br><strong>The Tech Dhaara Team</strong></p>
        </div>
      `).catch(() => {});
    }

    Notification.create({
      recipient: recipient._id,
      type: 'NEW_INNOVATION_PUBLISHED',
      title: 'New Innovation Published',
      message: `${innovatorName} published a new innovation: "${innovationTitle}".`,
      entityType: 'Innovation',
      entityId: innovation._id
    }).catch(() => {});
  }
};

const broadcastNewProblemPublished = async (problem, poster) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const problemTitle = problem.problemTitle || 'a new problem';

  const recipients = await User.find({
    role: 'INNOVATOR',
    status: 'APPROVED'
  }).select('_id fullName email phone isEmailUser isPhoneUser isEmailVerified isPhoneVerified isGoogleUser');

  for (const recipient of recipients) {
    const name = recipient.fullName || 'User';

    if (recipient.isPhoneUser && recipient.isPhoneVerified && recipient.phone) {
      sendWhatsAppMessage(recipient.phone, `🌱 *New Problem Statement on Tech Dhaara!*\n\nHi ${name},\n\nA new problem has been posted: *"${problemTitle}"*\n\nYour innovation might be the solution! Login to view it.\n\n---\nTech Dhaara Team`).catch(() => {});
    } else if ((recipient.isEmailUser || recipient.isGoogleUser) && recipient.isEmailVerified && recipient.email) {
      sendEmail(recipient.email, `New Problem Statement: "${problemTitle}"`, `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #123E39;">New Problem Statement Posted!</h2>
          <p>Hi ${name},</p>
          <p>A new problem <strong>"${problemTitle}"</strong> has been published on the Tech Dhaara platform.</p>
          <p>Your innovation might be the perfect solution!</p>
          <p><a href="${frontendUrl}/problems/${problem._id}" style="background:#A54025;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">View Problem</a></p>
          <p>Best regards,<br><strong>The Tech Dhaara Team</strong></p>
        </div>
      `).catch(() => {});
    }

    Notification.create({
      recipient: recipient._id,
      type: 'NEW_PROBLEM_PUBLISHED',
      title: 'New Problem Statement Published',
      message: `A new problem "${problemTitle}" has been posted. Your innovation might be the solution!`,
      entityType: 'Problem',
      entityId: problem._id
    }).catch(() => {});
  }
};

const broadcastNewAoApproved = async (aoUser, aoProfile) => {
  const orgName = aoProfile?.orgName || aoUser.fullName || 'A new organization';

  const recipients = await User.find({
    role: 'INNOVATOR',
    status: 'APPROVED'
  }).select('_id fullName email phone isEmailUser isPhoneUser isEmailVerified isPhoneVerified isGoogleUser');

  for (const recipient of recipients) {
    const name = recipient.fullName || 'User';

    if (recipient.isPhoneUser && recipient.isPhoneVerified && recipient.phone) {
      sendWhatsAppMessage(recipient.phone, `🌟 *New Organization on Tech Dhaara!*\n\nHi ${name},\n\n*${orgName}* has joined the Tech Dhaara network.\n\nNew opportunities for your innovations!\n\n---\nTech Dhaara Team`).catch(() => {});
    } else if ((recipient.isEmailUser || recipient.isGoogleUser) && recipient.isEmailVerified && recipient.email) {
      sendEmail(recipient.email, 'New Organization Joined Tech Dhaara', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #123E39;">New Organization on the Platform!</h2>
          <p>Hi ${name},</p>
          <p><strong>${orgName}</strong> has just joined the Tech Dhaara network.</p>
          <p>This means more opportunities for your innovations to reach new communities!</p>
          <p>Best regards,<br><strong>The Tech Dhaara Team</strong></p>
        </div>
      `).catch(() => {});
    }

    Notification.create({
      recipient: recipient._id,
      type: 'NEW_AO_APPROVED',
      title: 'New Organization Joined',
      message: `${orgName} has joined the Tech Dhaara network.`,
      entityType: 'User',
      entityId: aoUser._id
    }).catch(() => {});
  }
};

module.exports = {
  broadcastNewInnovationPublished,
  broadcastNewProblemPublished,
  broadcastNewAoApproved
};
