const { sendEmail } = require('../channels/email');
const Notification = require('../../../models/Notification');
const User = require('../../../models/User');
const Innovation = require('../../../models/Innovation');

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Email every approved Admin / Super Admin and add one entry to the shared admin
 * notification feed (recipient: null).
 *
 * @param {Object} opts
 * @param {string} opts.subject   Email subject line
 * @param {string} opts.heading   Heading shown inside the email
 * @param {string} opts.intro     First sentence of the email
 * @param {Array<[string,string]>} opts.details  Label/value rows shown in the email
 * @param {string} opts.type      Notification.type value
 * @param {string} opts.title     Short title for the admin feed
 * @param {string} opts.message   Full sentence for the admin feed
 * @param {string} [opts.entityType]
 * @param {*} [opts.entityId]
 */
const notifyAdmins = async ({ subject, heading, intro, details = [], type, title, message, entityType = null, entityId = null }) => {
  const admins = await User.find({
    role: { $in: ['ADMIN', 'SUPER_ADMIN'] },
    status: 'APPROVED'
  }).select('_id email isEmailUser isGoogleUser isEmailVerified').lean();

  const detailHtml = details
    .filter(([, value]) => value)
    .map(([label, value]) => `<p style="font-size: 16px; color: #3D3D3D;"><strong>${label}:</strong> ${value}</p>`)
    .join('\n            ');

  for (const admin of admins) {
    if ((admin.isEmailUser || admin.isGoogleUser) && admin.isEmailVerified && admin.email) {
      sendEmail(admin.email, subject, `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #123E39;">${heading}</h2>
            <p style="font-size: 16px; color: #3D3D3D;">${intro}</p>
            ${detailHtml}
            <p style="margin-top: 24px;">
              <a href="${frontendUrl}/admin" style="background:#A54025;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">View Dashboard</a>
            </p>
            <p style="font-size: 16px; color: #3D3D3D; margin-top: 24px;">Best regards,<br><strong>The Tech Dhaara System</strong></p>
          </div>
        </div>
      `).catch(() => {});
    }
  }

  Notification.create({
    recipient: null,
    type,
    title,
    message,
    entityType,
    entityId
  }).catch(() => {});
};

/**
 * A pilot request was raised — by a VLE directly, or by an AO / NO on a VLE's behalf.
 * @param {Object} vleUser       The VLE the pilot is for
 * @param {Object} [orgUser]     The AO / NO involved (the VLE's AO, or the org that raised it)
 * @param {Object} innovation
 * @param {Object} [options]
 * @param {boolean} [options.raisedByOrg]  true when the AO / NO raised it on the VLE's behalf
 */
const sendPilotRequestToAdmin = async (vleUser, orgUser, innovation, { raisedByOrg = false } = {}) => {
  const vleName = vleUser?.fullName || 'A VLE';
  const orgName = orgUser?.fullName || 'an Affiliated Organization';
  const innovationTitle = innovation?.innovationName || 'an innovation';

  const message = raisedByOrg
    ? `${orgName} submitted a pilot request for "${innovationTitle}" on behalf of ${vleName}.`
    : `${vleName} (under ${orgName}) submitted a pilot request for "${innovationTitle}".`;

  await notifyAdmins({
    subject: `New Pilot Request Submitted - "${innovationTitle}"`,
    heading: 'New Pilot Request',
    intro: 'A new pilot request has been submitted.',
    details: [
      ['VLE', vleName],
      [raisedByOrg ? 'Submitted by' : 'Affiliated Organization', orgName],
      ['Innovation', innovationTitle]
    ],
    type: 'PILOT_REQUEST_SUBMITTED',
    title: 'New Pilot Request',
    message,
    entityType: 'Innovation',
    entityId: innovation?._id
  });
};

const ADMIN_STATUS_TEXT = {
  PILOT_STARTED: { title: 'Pilot Started', verb: 'started' },
  TRIAL_STARTED: { title: 'Pilot Trial Started', verb: 'moved to the trial phase' },
  IMPLEMENTED: { title: 'Pilot Implemented', verb: 'marked as implemented' },
  CANCELLED: { title: 'Pilot Cancelled', verb: 'cancelled' }
};

/**
 * A pilot's status was changed by someone other than Admin (an AO or NO).
 * Admin-made changes are not echoed back to the admin feed.
 */
const sendPilotStatusChangedToAdmin = async (pilot, newStatus, actorUser) => {
  const text = ADMIN_STATUS_TEXT[newStatus];
  if (!text) return;

  const [vleUser, innovation] = await Promise.all([
    User.findById(pilot.vleId).select('fullName').lean(),
    Innovation.findById(pilot.innovationId).select('innovationName').lean()
  ]);

  const vleName = vleUser?.fullName || 'a VLE';
  const actorName = actorUser?.fullName || 'An organization';
  const innovationTitle = innovation?.innovationName || 'an innovation';

  await notifyAdmins({
    subject: `${text.title} - "${innovationTitle}"`,
    heading: text.title,
    intro: `A pilot has been ${text.verb}.`,
    details: [
      ['Innovation', innovationTitle],
      ['VLE', vleName],
      ['Updated by', actorName]
    ],
    type: newStatus === 'IMPLEMENTED' ? 'PILOT_IMPLEMENTED' : 'PILOT_STATUS_CHANGED',
    title: text.title,
    message: `${actorName} ${text.verb} the pilot for "${innovationTitle}" (VLE: ${vleName}).`,
    entityType: 'Pilot',
    entityId: pilot._id
  });
};

/**
 * A business model was submitted for a pilot (by the VLE, or by an AO / NO for the VLE).
 */
const sendBusinessModelSubmittedToAdmin = async (businessModel, submitterUser) => {
  const [vleUser, innovation] = await Promise.all([
    User.findById(businessModel.postedBy).select('fullName').lean(),
    Innovation.findById(businessModel.innovationId).select('innovationName').lean()
  ]);

  const vleName = vleUser?.fullName || 'a VLE';
  const submitterName = submitterUser?.fullName || vleName;
  const innovationTitle = innovation?.innovationName || 'an innovation';
  const onBehalf = submitterUser && vleUser && submitterUser._id?.toString() !== businessModel.postedBy?.toString();

  await notifyAdmins({
    subject: `New Business Model Submitted - "${innovationTitle}"`,
    heading: 'New Business Model',
    intro: 'A business model has been submitted for a pilot.',
    details: [
      ['Innovation', innovationTitle],
      ['VLE', vleName],
      ['Submitted by', submitterName]
    ],
    type: 'BUSINESS_MODEL_SUBMITTED',
    title: 'New Business Model',
    message: onBehalf
      ? `${submitterName} submitted a business model for "${innovationTitle}" on behalf of ${vleName}.`
      : `${vleName} submitted a business model for "${innovationTitle}".`,
    entityType: 'Pilot',
    entityId: businessModel.pilotId
  });
};

module.exports = {
  sendPilotRequestToAdmin,
  sendPilotStatusChangedToAdmin,
  sendBusinessModelSubmittedToAdmin
};
