const { sendEmail } = require('../channels/email');

const sendNewsletterWelcomeEmail = async (email) => {
  const subject = 'Welcome to Tech Dhaara Newsletter!';
  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #5E9E26; margin: 0;">Welcome to Tech Dhaara Newsletter!</h1>
          </div>

          <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi there,</p>

          <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
            Thank you for subscribing to the Tech Dhaara newsletter! We're excited to have you join our community.
          </p>

          <div style="background-color: #F9F7F3; padding: 20px; border-left: 4px solid #5E9E26; margin: 20px 0;">
            <p style="margin: 0; color: #123E39; font-weight: bold;">Here's what you can expect:</p>
            <ul style="color: #123E39; margin: 10px 0;">
              <li>Latest agricultural innovations and solutions</li>
              <li>Success stories from farmers and innovators</li>
              <li>Upcoming events and opportunities</li>
              <li>Expert insights and industry trends</li>
            </ul>
          </div>

          <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
            Stay tuned for our updates on agricultural innovation, technology, and community success stories!
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}"
               style="display: inline-block; background-color: #A54025; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Visit Tech Dhaara
            </a>
          </div>

          <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
            Best regards,<br>
            <strong>The Tech Dhaara Team</strong>
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

          <p style="color: #666666; font-size: 12px; text-align: center;">
            You're receiving this email because you subscribed to Tech Dhaara newsletter.<br>
            If you wish to unsubscribe, please contact our support team.
          </p>
        </div>
      </div>
    `;
  return sendEmail(email, subject, html);
};

module.exports = {
  sendNewsletterWelcomeEmail
};
