const NewsletterSubscription = require('../../../models/NewsletterSubscription');
const catchAsync = require('../../../utils/catchAsync');
const { sendNewsletterWelcomeEmail } = require('../../../services/notification/common/newsletterEmail');

const subscribeToNewsletter = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const existing = await NewsletterSubscription.findOne({ email });

  if (existing) {
    return res.status(200).json({
      status: 'success',
      message: 'You are already subscribed to our newsletter',
      data: { subscription: { email: existing.email, createdAt: existing.createdAt } }
    });
  }

  const subscription = await NewsletterSubscription.create({ email });

  try {
    await sendNewsletterWelcomeEmail(email);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }

  res.status(201).json({
    status: 'success',
    message: 'Successfully subscribed to newsletter! Check your email for confirmation.',
    data: { subscription: { email: subscription.email, createdAt: subscription.createdAt } }
  });
});

module.exports = { subscribeToNewsletter };
