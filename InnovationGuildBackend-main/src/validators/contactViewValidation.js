const { z } = require('zod');

const viewContactSchema = z.object({
  userId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')
});

module.exports = {
  viewContactSchema
};
