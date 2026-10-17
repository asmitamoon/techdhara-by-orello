const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const config = require('../../../config');

const _send = async (phone, messageBody) => {
  const to = phone.startsWith('+') ? `whatsapp:${phone}` : `whatsapp:+${phone}`;
  const response = await client.messages.create({
    from: `whatsapp:${config.twilio.whatsappNumber}`,
    body: messageBody,
    to
  });
  return { success: true, sid: response.sid };
};

const sendWhatsAppApproval = async (phone, userName, role) => {
  const messageBody = `🎉 *Congratulations ${userName}!*

Your *${role}* account on Tech Dhaara has been *APPROVED* by our admin team.

✅ *You can now:*
• Access all platform features
• Connect with innovators and entrepreneurs
• Share and explore agricultural innovations
• Participate in community discussions

Welcome to the Tech Dhaara community! 🌱

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppRejection = async (phone, userName, reason) => {
  const messageBody = `📋 *Application Update*

Hi ${userName},

Thank you for your interest in joining Tech Dhaara.

After careful review, we regret to inform you that we are unable to approve your application at this time.

${reason ? `❗ *Reason:* ${reason}\n` : ''}📌 *What's Next?*
• Review our platform guidelines
• Update your profile with complete information
• Reapply after addressing the feedback
• Contact our support team if you have questions

We appreciate your understanding and encourage you to reach out if you have any questions.

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppMessage = async (phone, body) => _send(phone, body);

const sendWhatsAppInnovationApproval = async (phone, userName, innovationTitle) => {
  const messageBody = `🎉 *Congratulations ${userName}!*

Your innovation *"${innovationTitle}"* has been APPROVED and is now PUBLISHED!

✅ *Your innovation is now:*
• Visible to all VLEs and farmers
• Auto-matched with relevant problems
• Open for likes and comments

View your innovation and start connecting with users! 🚀

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppInnovationRejection = async (phone, userName, innovationTitle, reason) => {
  const messageBody = `📋 *Innovation Submission Update*

Hi ${userName},

Your innovation submission *"${innovationTitle}"* requires revision.

❗ *Reason:* ${reason || 'Please review admin feedback'}

📌 *Next Steps:*
• Review the feedback
• Edit your innovation
• Resubmit for approval

We're here to help! Contact us if you have questions.

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppProblemApproval = async (phone, userName, problemTitle) => {
  const messageBody = `✅ *Great News ${userName}!*

Your problem *"${problemTitle}"* has been APPROVED and is now PUBLISHED!

🎯 *What happens now:*
• Innovators can see your problem
• Auto-matching with relevant innovations
• Community can comment and upvote

Your problem is helping drive innovation! 🌱

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppProblemRejection = async (phone, userName, problemTitle, reason) => {
  const messageBody = `📋 *Problem Submission Update*

Hi ${userName},

Your problem *"${problemTitle}"* needs improvement.

❗ *Reason:* ${reason || 'Please review admin feedback'}

📌 *Next Steps:*
• Review admin feedback
• Update your problem details
• Resubmit for approval

We're here to support you!

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppInnovationComment = async (phone, ownerName, commenterName, innovationTitle, commentContent) => {
  const messageBody = `💬 *New Comment on Your Innovation!*

Hi ${ownerName},

${commenterName} just commented on your innovation *"${innovationTitle}"*:

_"${commentContent}"_

Login to Tech Dhaara to view the comment and reply!

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppProblemComment = async (phone, ownerName, commenterName, problemTitle, commentContent) => {
  const messageBody = `💬 *New Comment on Your Problem!*

Hi ${ownerName},

${commenterName} just commented on your problem *"${problemTitle}"*:

_"${commentContent}"_

Login to Tech Dhaara to view the comment and reply!

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppRequestEdit = async (phone, userName, reason, contentType, contentTitle) => {
  const contentLabel = contentType ? contentType.charAt(0).toUpperCase() + contentType.slice(1).toLowerCase() : 'Content';
  const contentDisplay = contentTitle ? `*${contentLabel}*: "${contentTitle}"` : `*${contentLabel}*`;
  const messageBody = `✏️ *Edit Request - Tech Dhaara*

Hi ${userName},

Our admin team has reviewed your ${contentDisplay} and would like you to make some edits.

❗ *Admin's Request:*
${reason}

📌 *Next Steps:*
• Login to your account
• Find and edit the ${contentLabel.toLowerCase()}
• Resubmit for review when done

Contact us if you have any questions.

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppServiceRequestApproval = async (phone, userName, techName) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const messageBody = `🎉 *Service Request Approved!*

Hi ${userName},

Your service request *"${techName}"* has been approved and is now published on Tech Dhaara.

Innovators can now view and respond to your request.

View your service requests: ${frontendUrl}/my-problem-statements

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppServiceRequestRejection = async (phone, userName, techName, reason) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const messageBody = `📋 *Service Request Update*

Hi ${userName},

Your service request *"${techName}"* was not approved at this time.${reason ? `\n\n❗ *Reason:* ${reason}` : ''}

Update your submission: ${frontendUrl}/my-problem-statements

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppPendingAo = async (phone, nodalOrgName, aoName, orgName) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const messageBody = `🔔 *New AO Registration Request*

Hi ${nodalOrgName},

${aoName} from *${orgName}* has registered as an AO and selected your organization for approval.

Login to review and approve or reject: ${frontendUrl}/nodal-org/pending-aos

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppAoApproval = async (phone, aoName, nodalOrgName) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const messageBody = `🎉 *AO Registration Approved!*

Hi ${aoName},

Your AO registration has been approved by *${nodalOrgName}*.

✅ You can now register and manage VLEs, submit field reports, and access all AO features.

Go to your dashboard: ${frontendUrl}/ao

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

const sendWhatsAppAoRejection = async (phone, aoName, nodalOrgName, reason) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const messageBody = `📋 *AO Registration Update*

Hi ${aoName},

${nodalOrgName} has not approved your AO registration request at this time.${reason ? `\n\n❗ *Reason:* ${reason}` : ''}

Contact support for assistance: ${frontendUrl}/contact

---
Tech Dhaara Team`;
  return _send(phone, messageBody);
};

module.exports = {
  sendWhatsAppApproval,
  sendWhatsAppRejection,
  sendWhatsAppMessage,
  sendWhatsAppInnovationApproval,
  sendWhatsAppInnovationRejection,
  sendWhatsAppProblemApproval,
  sendWhatsAppProblemRejection,
  sendWhatsAppInnovationComment,
  sendWhatsAppProblemComment,
  sendWhatsAppRequestEdit,
  sendWhatsAppPendingAo,
  sendWhatsAppAoApproval,
  sendWhatsAppAoRejection,
  sendWhatsAppServiceRequestApproval,
  sendWhatsAppServiceRequestRejection
};
