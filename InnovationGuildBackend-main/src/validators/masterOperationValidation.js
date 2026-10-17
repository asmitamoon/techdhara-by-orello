const { z } = require('zod');

const addOperationSchema = z.object({
  label: z.string()
    .min(2, 'Operation name must be at least 2 characters')
    .max(50, 'Operation name is too long (max 50 characters)')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Only letters, numbers, spaces, hyphens, and underscores allowed')
    .trim()
});

module.exports = { addOperationSchema };
