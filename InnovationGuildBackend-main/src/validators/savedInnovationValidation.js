const { z } = require('zod');

const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID');

const saveInnovationSchema = z.object({
  innovationId: mongoIdSchema
});

const getSavedInnovationsSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .pipe(z.number().min(1))
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default('20'),
  search: z.string().trim().optional()
});

module.exports = {
  saveInnovationSchema,
  getSavedInnovationsSchema
};
