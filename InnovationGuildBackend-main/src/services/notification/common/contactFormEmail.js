const { sendEmail } = require('../channels/email');

const sendContactFormToAdmin = async (formData) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.FROM_EMAIL || 'nana.naveen50@gmail.com';
  const subject = `New Contact Form: ${formData.subject}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #123E39; margin: 0;">New Contact Form Submission</h1>
        </div>

        <div style="background-color: #ECE8DE; padding: 20px; border-left: 4px solid #123E39; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #123E39;">Contact Details:</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${formData.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${formData.contactNumber}">${formData.contactNumber}</a></p>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${formData.subject}</p>
        </div>

        <div style="background-color: #FEF2EB; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #3D3D3D;">Message:</h3>
          <p style="margin: 0; color: #666666; line-height: 1.6; white-space: pre-wrap;">${formData.message}</p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ECE8DE;">

        <p style="color: #666666; font-size: 12px; text-align: center;">
          This is an automated notification from Tech Dhaara Contact Form.<br>
          You can reply directly to this email to respond to ${formData.name}.
        </p>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, subject, html, { replyTo: formData.email });
};

const sendThankYouToUser = async (name, email) => {
  const subject = 'Thank You for Contacting Tech Dhaara';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F9F7F3; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5E9E26; margin: 0;">Thank You for Contacting Us!</h1>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">Hi ${name},</p>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          We've received your message and our team will get back to you within 24-48 hours.
        </p>

        <div style="background-color: #F9F7F3; padding: 20px; border-left: 4px solid #5E9E26; margin: 20px 0;">
          <p style="margin: 0; color: #123E39; font-weight: bold;">What happens next?</p>
          <ul style="color: #123E39; margin: 10px 0;">
            <li>Our team will review your message</li>
            <li>You'll receive a response via email</li>
            <li>We typically respond within 24-48 hours</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #3D3D3D; line-height: 1.6;">
          In the meantime, feel free to explore our platform and discover innovative agricultural solutions.
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
          This is an automated confirmation email.<br>
          If you have urgent questions, please reply to this email.
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
};

module.exports = {
  sendContactFormToAdmin,
  sendThankYouToUser
};
