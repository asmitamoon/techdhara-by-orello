const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const _send = async (phone, body) => {
  const response = await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
  return response;
};

const sendOTPSMS = async (phone, otp) => {
  const body = `Your Tech Dhaara verification code is: ${otp}. This code expires in 10 minutes.`;
  return _send(phone, body);
};

const sendWelcomeSMS = async (phone, name) => {
  const body = `Welcome to Tech Dhaara, ${name}! Your account has been verified successfully.`;
  return _send(phone, body);
};

const sendApprovalSMS = async (phone, userName, role) => {
  const body = `Tech Dhaara: Congratulations ${userName}! Your ${role} account has been approved. You can now access all platform features.`;
  return _send(phone, body);
};

const sendRejectionSMS = async (phone, userName, reason) => {
  const body = `Tech Dhaara: Hi ${userName}, your account application was not approved at this time.${reason ? ` Reason: ${reason}` : ''} Contact support for assistance.`;
  return _send(phone, body);
};

const sendInnovationApprovalSMS = async (phone, userName, innovationTitle) => {
  const body = `Tech Dhaara: Congratulations ${userName}! Your innovation "${innovationTitle}" has been approved and is now published.`;
  return _send(phone, body);
};

const sendInnovationRejectionSMS = async (phone, userName, innovationTitle, reason) => {
  const body = `Tech Dhaara: Hi ${userName}, your innovation "${innovationTitle}" requires revision.${reason ? ` Reason: ${reason}` : ''} Please login to update and resubmit.`;
  return _send(phone, body);
};

const sendProblemApprovalSMS = async (phone, userName, problemTitle) => {
  const body = `Tech Dhaara: Great news ${userName}! Your problem "${problemTitle}" has been approved and is now published.`;
  return _send(phone, body);
};

const sendProblemRejectionSMS = async (phone, userName, problemTitle, reason) => {
  const body = `Tech Dhaara: Hi ${userName}, your problem "${problemTitle}" needs improvement.${reason ? ` Reason: ${reason}` : ''} Please login to update and resubmit.`;
  return _send(phone, body);
};

const sendCommentSMS = async (phone, ownerName, commenterName, contentTitle, contentType) => {
  const body = `Tech Dhaara: Hi ${ownerName}, ${commenterName} commented on your ${contentType || 'post'} "${contentTitle}". Login to view and reply.`;
  return _send(phone, body);
};

const sendRequestEditSMS = async (phone, userName, reason, contentType, contentTitle) => {
  const contentLabel = contentType ? contentType.charAt(0).toUpperCase() + contentType.slice(1).toLowerCase() : 'content';
  const contentDisplay = contentTitle ? `${contentLabel} "${contentTitle}"` : contentLabel;
  const body = `Tech Dhaara: Hi ${userName}, our admin has requested edits to your ${contentDisplay}. Reason: ${reason}. Please login to make the changes.`;
  return _send(phone, body);
};

const sendPendingAoSMS = async (phone, aoName, orgName) => {
  const body = `Tech Dhaara: New AO registration from ${aoName} (${orgName}) awaits your approval. Login to review.`;
  return _send(phone, body);
};

const sendAoApprovalSMS = async (phone, aoName, nodalOrgName) => {
  const body = `Tech Dhaara: Congratulations ${aoName}! Your AO registration has been approved by ${nodalOrgName}. You can now access all platform features.`;
  return _send(phone, body);
};

const sendAoRejectionSMS = async (phone, aoName, nodalOrgName, reason) => {
  const body = `Tech Dhaara: Hi ${aoName}, your AO registration was not approved by ${nodalOrgName}. Reason: ${reason || 'Not specified'}. Contact support for assistance.`;
  return _send(phone, body);
};

const sendServiceRequestApprovalSMS = async (phone, userName, techName) => {
  const body = `Tech Dhaara: Congratulations ${userName}! Your service request "${techName}" has been approved and is now published.`;
  return _send(phone, body);
};

const sendServiceRequestRejectionSMS = async (phone, userName, techName, reason) => {
  const body = `Tech Dhaara: Hi ${userName}, your service request "${techName}" was not approved.${reason ? ` Reason: ${reason}` : ''} Please login to review and update.`;
  return _send(phone, body);
};

const sendSMS = async (phone, body) => _send(phone, body);

module.exports = {
  sendSMS,
  sendOTPSMS,
  sendWelcomeSMS,
  sendApprovalSMS,
  sendRejectionSMS,
  sendInnovationApprovalSMS,
  sendInnovationRejectionSMS,
  sendProblemApprovalSMS,
  sendProblemRejectionSMS,
  sendCommentSMS,
  sendRequestEditSMS,
  sendPendingAoSMS,
  sendAoApprovalSMS,
  sendAoRejectionSMS,
  sendServiceRequestApprovalSMS,
  sendServiceRequestRejectionSMS
};
