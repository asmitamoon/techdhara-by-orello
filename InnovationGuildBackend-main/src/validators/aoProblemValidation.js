const { z } = require('zod');
const { createInnovationRequestSchema } = require('./innovationRequestValidation');

const aoCreateProblemSchema = z.object({
  vleId: z.string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid VLE ID'),
}).and(createInnovationRequestSchema);

module.exports = {
  aoCreateProblemSchema,
};
