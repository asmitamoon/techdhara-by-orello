const sgMail = require('@sendgrid/mail');
const config = require('../../../config');

sgMail.setApiKey(config.sendgridApiKey);

// SendGrid only — sends over HTTPS (443), which works on hosts that block outbound SMTP ports.
const _send = async (to, subject, html, opts = {}) => {
  await sgMail.send({
    to,
    from: config.fromEmail,
    subject,
    html,
    ...opts
  });
  return { success: true };
};

const sendOTPEmail = async (email, otp, purpose = 'login') => {
  const templates = {
    registration: {
      subject: 'Verify your Tech Dhaara account',
      heading: 'Email Verification',
      body: 'Your OTP to verify your email is:',
      footer: "If you didn't create an account, please ignore this email.",
    },
    password_reset: {
      subject: 'Your Tech Dhaara Password Reset OTP',
      heading: 'Password Reset',
      body: 'Your OTP to reset your password is:',
      footer: "If you didn't request a password reset, please ignore this email.",
    },
    login: {
      subject: 'Your Tech Dhaara Login OTP',
      heading: 'Tech Dhaara Login',
      body: 'Your OTP for login is:',
      footer: "If you didn't request this login, please ignore this email.",
    },
  };
  const t = templates[purpose] || templates.login;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #123E39;">${t.heading}</h2>
      <p>${t.body}</p>
      <div style="background-color: #FEF2EB; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #A54025; font-size: 32px; margin: 0;">${otp}</h1>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>${t.footer}</p>
      <hr style="margin: 30px 0;">
      <p style="color: #666666; font-size: 12px;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;
  return _send(email, t.subject, html);
};

const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Tech Dhaara!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #123E39;">Welcome to Tech Dhaara!</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Welcome to the Tech Dhaara platform! We're excited to have you join our community of innovators, entrepreneurs, and agricultural professionals.</p>
      <p>You can now access your account and start exploring opportunities, sharing ideas, and connecting with others in the agricultural innovation space.</p>
      <p>Best regards,<br>The Tech Dhaara Team</p>
      <hr style="margin: 30px 0;">
      <p style="color: #666666; font-size: 12px;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;
  return _send(email, subject, html);
};

const sendApprovalEmail = async (email, name, role) => {
  const subject = 'Congratulations! Your Tech Dhaara Account has been Approved 🎉';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5E9E26; margin: 0;">🎉 Account Approved!</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${name || 'there'},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Great news! Your <strong>${role}</strong> account on the Tech Dhaara platform has been approved by our admin team.
        </p>

        <div style="background-color: #F9F7F3; padding: 20px; border-left: 4px solid #5E9E26; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">You can now:</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Access all platform features</li>
            <li>Connect with other innovators and entrepreneurs</li>
            <li>Share and explore agricultural innovations</li>
            <li>Participate in community discussions</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Login to Your Account
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Welcome to the Tech Dhaara community! We're excited to have you on board.
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendRejectionEmail = async (email, name, reason) => {
  const subject = 'Update on Your Tech Dhaara Application';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A54025; margin: 0;">Application Update</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${name || 'there'},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Thank you for your interest in joining the Tech Dhaara platform.
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          After careful review, we regret to inform you that we are unable to approve your application at this time.
        </p>

        ${reason ? `
        <div style="background-color: #FEF2EB; padding: 20px; border-left: 4px solid #F39C31; margin: 20px 0;">
          <p style="margin: 0; color: #A3733E; font-weight: bold;">Reason:</p>
          <p style="margin: 10px 0 0 0; color: #A3733E;">${reason}</p>
        </div>
        ` : ''}

        <div style="background-color: #ECE8DE; padding: 20px; border-left: 4px solid #123E39; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">What's Next?</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Review our platform guidelines and requirements</li>
            <li>Update your profile with complete information</li>
            <li>Reapply after addressing the feedback</li>
            <li>Contact our support team if you have questions</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          We appreciate your understanding and encourage you to reach out to us if you have any questions or would like to discuss your application further.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Contact Support
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendInnovationApprovalEmail = async (email, userName, innovationTitle, innovationId) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = `🎉 Your Innovation "${innovationTitle}" has been Approved!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5E9E26; margin: 0;">🎉 Innovation Approved!</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${userName || 'there'},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Congratulations! Your innovation <strong>"${innovationTitle}"</strong> has been approved and is now <strong>PUBLISHED</strong> on the Tech Dhaara platform.
        </p>

        <div style="background-color: #F9F7F3; padding: 20px; border-left: 4px solid #5E9E26; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">Your innovation is now:</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Visible to all VLEs and farmers across the platform</li>
            <li>Auto-matched with relevant problems seeking solutions</li>
            <li>Open for community likes, comments, and engagement</li>
            <li>Discoverable in public searches and browse pages</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/innovations/${innovationId}"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            View Your Innovation
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Start connecting with users who need your solution! 🚀
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendInnovationRejectionEmail = async (email, userName, innovationTitle, reason) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Update on Your Innovation Submission';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A54025; margin: 0;">📋 Innovation Submission Update</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${userName || 'there'},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Thank you for submitting your innovation <strong>"${innovationTitle}"</strong> to the Tech Dhaara platform.
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          After careful review, we need you to make some revisions before we can publish your innovation.
        </p>

        ${reason ? `
        <div style="background-color: #FEF2EB; padding: 20px; border-left: 4px solid #F39C31; margin: 20px 0;">
          <p style="margin: 0; color: #A3733E; font-weight: bold;">Feedback from Admin:</p>
          <p style="margin: 10px 0 0 0; color: #A3733E;">${reason}</p>
        </div>
        ` : ''}

        <div style="background-color: #ECE8DE; padding: 20px; border-left: 4px solid #123E39; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">Next Steps:</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Review the admin feedback carefully</li>
            <li>Edit your innovation to address the concerns</li>
            <li>Ensure all required fields are complete and accurate</li>
            <li>Resubmit for approval when ready</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/innovator/innovations"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Edit Your Innovation
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          We're here to help you succeed! Contact our support team if you have any questions.
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendProblemApprovalEmail = async (email, userName, problemTitle, problemId) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = `✅ Your Problem "${problemTitle}" is Now Published!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5E9E26; margin: 0;">✅ Problem Published!</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${userName || 'there'},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Great news! Your problem <strong>"${problemTitle}"</strong> has been approved and is now <strong>PUBLISHED</strong> on the Tech Dhaara platform.
        </p>

        <div style="background-color: #F9F7F3; padding: 20px; border-left: 4px solid #5E9E26; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">What happens now:</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Innovators across the platform can see your problem</li>
            <li>Auto-matching system finds relevant innovations</li>
            <li>Community members can comment and upvote</li>
            <li>Potential solutions will be connected to your problem</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/problems/${problemId}"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            View Your Problem
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Your problem is helping drive agricultural innovation! 🌱
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendProblemRejectionEmail = async (email, userName, problemTitle, reason) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Update on Your Problem Submission';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A54025; margin: 0;">📋 Problem Submission Update</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${userName || 'there'},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Thank you for submitting your problem <strong>"${problemTitle}"</strong> to the Tech Dhaara platform.
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          After review, we need you to improve your problem description before we can publish it.
        </p>

        ${reason ? `
        <div style="background-color: #FEF2EB; padding: 20px; border-left: 4px solid #F39C31; margin: 20px 0;">
          <p style="margin: 0; color: #A3733E; font-weight: bold;">Feedback from Admin:</p>
          <p style="margin: 10px 0 0 0; color: #A3733E;">${reason}</p>
        </div>
        ` : ''}

        <div style="background-color: #ECE8DE; padding: 20px; border-left: 4px solid #123E39; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">Next Steps:</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Review the admin feedback carefully</li>
            <li>Update your problem details and description</li>
            <li>Provide clear, specific information about the issue</li>
            <li>Resubmit for approval when ready</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/my-problem-statements"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Edit Your Problem
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          We're here to support you! Contact us if you have any questions.
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendInnovationCommentEmail = async (email, ownerName, commenterName, innovationTitle, innovationId, commentContent) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = `💬 New Comment on Your Innovation: "${innovationTitle}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5E9E26; margin: 0;">💬 New Comment!</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${ownerName},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          <strong>${commenterName}</strong> just commented on your innovation <strong>"${innovationTitle}"</strong>:
        </p>

        <div style="background-color: #FEF2EB; border-left: 4px solid #5E9E26; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; color: #666666; font-style: italic;">"${commentContent}"</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${frontendUrl}/innovations/${innovationId}" style="background-color: #A54025; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Comment & Reply</a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated notification from Tech Dhaara.<br>
          You received this because someone commented on your innovation.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendProblemCommentEmail = async (email, ownerName, commenterName, problemTitle, problemId, commentContent) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = `💬 New Comment on Your Problem: "${problemTitle}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #123E39; margin: 0;">💬 New Comment!</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${ownerName},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          <strong>${commenterName}</strong> just commented on your problem <strong>"${problemTitle}"</strong>:
        </p>

        <div style="background-color: #FEF2EB; border-left: 4px solid #123E39; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; color: #666666; font-style: italic;">"${commentContent}"</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${frontendUrl}/problems/${problemId}" style="background-color: #A54025; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Comment & Reply</a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated notification from Tech Dhaara.<br>
          You received this because someone commented on your problem.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendRequestEditEmail = async (email, userName, reason, contentType, contentTitle) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const contentLabel = contentType ? contentType.charAt(0).toUpperCase() + contentType.slice(1).toLowerCase() : 'Content';
  const editLink = contentType === 'Innovation'
    ? `${frontendUrl}/innovator/innovations`
    : `${frontendUrl}/my-problem-statements`;
  const subject = contentTitle
    ? `✏️ Edit Request for Your ${contentLabel}: "${contentTitle}" - Tech Dhaara`
    : `✏️ Edit Request for Your ${contentLabel} - Tech Dhaara`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #F39C31; margin: 0;">✏️ Edit Request</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${userName || 'there'},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Our admin team has reviewed your ${contentLabel}${contentTitle ? ` <strong>"${contentTitle}"</strong>` : ''} on the Tech Dhaara platform and would like you to make some edits.
        </p>

        <div style="background-color: #FEF2EB; padding: 20px; border-left: 4px solid #F39C31; margin: 20px 0;">
          <p style="margin: 0; color: #A3733E; font-weight: bold;">Admin's Request:</p>
          <p style="margin: 10px 0 0 0; color: #A3733E;">${reason}</p>
        </div>

        <div style="background-color: #ECE8DE; padding: 20px; border-left: 4px solid #123E39; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">Next Steps:</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Login to your account</li>
            <li>Find the ${contentLabel.toLowerCase()} mentioned above</li>
            <li>Make the requested edits</li>
            <li>Resubmit for review when ready</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${editLink}"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Go to Edit
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          If you have any questions about this request, please contact our support team.
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendPendingAoEmail = async (email, nodalOrgName, aoName, aoProfile) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = '🔔 New AO Registration Request Awaiting Your Approval';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #123E39; margin: 0;">🔔 New AO Registration Request</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${nodalOrgName},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          An Agricultural Officer (AO) has registered on the Tech Dhaara platform and selected your organization for approval.
        </p>

        <div style="background-color: #ECE8DE; padding: 20px; border-left: 4px solid #123E39; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">AO Details:</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li><strong>Name:</strong> ${aoName}</li>
            <li><strong>Organization:</strong> ${aoProfile.orgName}</li>
            <li><strong>AO Type:</strong> ${aoProfile.orgType}</li>
            <li><strong>Location:</strong> ${aoProfile.village}, ${aoProfile.district}, ${aoProfile.state}</li>
          </ul>
        </div>

        <div style="background-color: #FEF2EB; padding: 20px; border-left: 4px solid #F39C31; margin: 20px 0;">
          <p style="margin: 0; color: #A3733E; font-weight: bold;">⏰ Action Required</p>
          <p style="margin: 10px 0 0 0; color: #A3733E;">Please review this AO's profile and approve or reject their registration request.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/nodal-org/pending-aos"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Review AO Request
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated notification from Tech Dhaara.<br>
          You received this because an AO selected your organization for approval.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendAoApprovalEmail = async (email, aoName, nodalOrgName) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = '🎉 Congratulations! Your AO Registration has been Approved';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5E9E26; margin: 0;">🎉 Registration Approved!</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${aoName},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Great news! Your Agricultural Officer (AO) registration has been approved by <strong>${nodalOrgName}</strong>.
        </p>

        <div style="background-color: #F9F7F3; padding: 20px; border-left: 4px solid #5E9E26; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">You can now:</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Access all AO platform features</li>
            <li>Register and manage VLEs (Village Level Entrepreneurs)</li>
            <li>Create problems on behalf of VLEs</li>
            <li>Submit field reports for pilot programs</li>
            <li>Connect with innovators and other stakeholders</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/ao"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Go to Your Dashboard
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Welcome to the Tech Dhaara community! We're excited to have you on board.
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendAoRejectionEmail = async (email, aoName, nodalOrgName, reason) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Update on Your AO Registration Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A54025; margin: 0;">📋 Registration Update</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${aoName},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Thank you for your interest in joining the Tech Dhaara platform as an Agricultural Officer (AO).
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          After review, <strong>${nodalOrgName}</strong> has decided not to approve your registration request at this time.
        </p>

        ${reason ? `
        <div style="background-color: #FEF2EB; padding: 20px; border-left: 4px solid #F39C31; margin: 20px 0;">
          <p style="margin: 0; color: #A3733E; font-weight: bold;">Reason for Rejection:</p>
          <p style="margin: 10px 0 0 0; color: #A3733E;">${reason}</p>
        </div>
        ` : ''}

        <div style="background-color: #ECE8DE; padding: 20px; border-left: 4px solid #123E39; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">What's Next?</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Review the feedback from your Nodal Organization</li>
            <li>Contact ${nodalOrgName} directly for clarification</li>
            <li>Consider registering under a different Nodal Organization</li>
            <li>Ensure all your information is complete and accurate</li>
            <li>Contact our support team if you need assistance</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/contact"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Contact Support
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          We appreciate your understanding and encourage you to reach out if you have any questions.
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendServiceRequestApprovalEmail = async (email, userName, techName) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = '🎉 Your Service Request has been Approved!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5E9E26; margin: 0;">🎉 Service Request Approved!</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${userName || 'there'},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Great news! Your service request <strong>"${techName}"</strong> has been approved and is now published on the Tech Dhaara platform.
        </p>

        <div style="background-color: #F9F7F3; padding: 20px; border-left: 4px solid #5E9E26; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">What happens next?</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Your service request is now visible to innovators on the platform</li>
            <li>You may receive proposals and solutions from innovators</li>
            <li>You'll be notified when someone responds to your request</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/my-problem-statements"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            View Your Service Request
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendServiceRequestRejectionEmail = async (email, userName, techName, reason) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const subject = 'Update on Your Service Request - Tech Dhaara';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A54025; margin: 0;">Service Request Update</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${userName || 'there'},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Thank you for submitting your service request <strong>"${techName}"</strong> to the Tech Dhaara platform.
        </p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          After review, our admin team was unable to approve your service request at this time.
        </p>

        ${reason ? `
        <div style="background-color: #FEF2EB; padding: 20px; border-left: 4px solid #F39C31; margin: 20px 0;">
          <p style="margin: 0; color: #A3733E; font-weight: bold;">Reason:</p>
          <p style="margin: 10px 0 0 0; color: #A3733E;">${reason}</p>
        </div>
        ` : ''}

        <div style="background-color: #ECE8DE; padding: 20px; border-left: 4px solid #123E39; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">What you can do:</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Review the feedback and update your service request</li>
            <li>Ensure all required details are complete and accurate</li>
            <li>Resubmit after making improvements</li>
            <li>Contact support if you need assistance</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/my-problem-statements"
             style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Update Your Service Request
          </a>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          Best regards,<br>
          <strong>The Tech Dhaara Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
  return _send(email, subject, html);
};

const sendEmail = async (to, subject, html, opts) => _send(to, subject, html, opts);

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendInnovationApprovalEmail,
  sendInnovationRejectionEmail,
  sendProblemApprovalEmail,
  sendProblemRejectionEmail,
  sendInnovationCommentEmail,
  sendProblemCommentEmail,
  sendRequestEditEmail,
  sendPendingAoEmail,
  sendAoApprovalEmail,
  sendAoRejectionEmail,
  sendServiceRequestApprovalEmail,
  sendServiceRequestRejectionEmail
};
