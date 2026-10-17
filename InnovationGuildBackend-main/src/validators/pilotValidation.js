const { z } = require('zod');

const createPilotSchema = z.object({
  notes: z.string().trim().max(1000, 'Notes must not exceed 1000 characters').optional()
});

const createPilotRequestSchema = z.object({
  problemId: z.string().trim().optional()
});

const getAllPilotsSchema = z.object({
  status: z.enum(['PENDING', 'PILOT_STARTED', 'TRIAL_STARTED', 'IMPLEMENTED', 'CANCELLED']).optional(),
  search: z.string().trim().optional(),
  state: z.string().trim().optional(),
  vleStatus: z.enum(['listed', 'interested', 'active', 'commercial']).optional(),
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .pipe(z.number().min(1))
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default('50')
});

module.exports = {
  createPilotSchema,
  createPilotRequestSchema,
  getAllPilotsSchema
};
