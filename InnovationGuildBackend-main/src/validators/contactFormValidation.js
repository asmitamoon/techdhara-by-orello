const { z } = require('zod');

const submitContactFormSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .max(255, 'Email address is too long'),
  contactNumber: z.string()
    .trim()
    .min(10, 'Contact number must be at least 10 digits')
    .max(20, 'Contact number is too long'),
  subject: z.string()
    .trim()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be at most 200 characters'),
  message: z.string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be at most 2000 characters')
});

module.exports = {
  submitContactFormSchema
};
