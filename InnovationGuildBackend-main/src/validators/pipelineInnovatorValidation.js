const { z } = require('zod');

const pipelineInnovatorSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long (max 50 characters)')
    .regex(/^[a-zA-Z\s]+$/, 'Name should only contain letters and spaces'),
  enterprise: z.string()
    .trim()
    .min(2, 'Enterprise name is required')
    .max(100, 'Too long (max 100 characters)'),
  emailId: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Too long (max 100 characters)'),
  mobile: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  state: z.string()
    .trim()
    .min(1, 'State is required'),
  district: z.string()
    .trim()
    .min(1, 'District is required'),
  link: z.string()
    .url('Please enter a valid URL (e.g. https://example.com)')
    .optional()
    .or(z.literal('')),
});

const updatePipelineInnovatorSchema = pipelineInnovatorSchema.partial();

module.exports = {
  pipelineInnovatorSchema,
  updatePipelineInnovatorSchema,
};
