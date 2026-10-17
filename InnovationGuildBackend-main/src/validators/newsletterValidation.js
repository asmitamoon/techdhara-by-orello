const { z } = require('zod');

const subscribeNewsletterSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .max(255, 'Email address is too long')
});

const getAllSubscriptionsSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .pipe(z.number().min(1))
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default('50'),
});

const deleteSubscriptionSchema = z.object({
  subscriptionId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid subscription ID format')
});

module.exports = {
  subscribeNewsletterSchema,
  getAllSubscriptionsSchema,
  deleteSubscriptionSchema
};
