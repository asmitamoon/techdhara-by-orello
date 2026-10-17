const { z } = require('zod');

const createCommentSchema = z.object({
  content: z.string()
    .trim()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must not exceed 1000 characters')
});

module.exports = {
  createCommentSchema
};
