const catchAsync = require('../../../utils/catchAsync');
const { sendContactFormToAdmin, sendThankYouToUser } = require('../../../services/notification/common/contactFormEmail');

const submitContactForm = catchAsync(async (req, res, next) => {
  const { name, email, contactNumber, subject, message } = req.body;

  try {
    await sendContactFormToAdmin({
      name,
      email,
      contactNumber,
      subject,
      message
    });
  } catch (emailError) {
    console.error('Failed to send contact form to admin:', emailError);
  }

  try {
    await sendThankYouToUser(name, email);
  } catch (emailError) {
    console.error('Failed to send thank you email to user:', emailError);
  }

  res.status(200).json({
    status: 'success',
    message: 'Thank you for contacting us! We will get back to you soon.',
    data: {
      name,
      email,
      subject
    }
  });
});

module.exports = {
  submitContactForm
};
