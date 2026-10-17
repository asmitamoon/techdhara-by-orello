const { z } = require('zod');
const {
  UNIT_TYPES,
  OWNERSHIP_TYPES,
  OWNERSHIP_INDIVIDUAL,
} = require('../utils/constants/problemConstants');

const serviceRequestBodySchema = z.object({
  unitType: z.string()
    .min(1, 'Unit type is required')
    .refine((val) => UNIT_TYPES.includes(val), { message: 'Please select a valid unit type' }),
  techName: z.string().min(2, 'Technology name is required').max(100, 'Name is too long (max 100 characters)'),
  techSpecs: z.string().min(5, 'Please provide basic specs').max(300, 'Too long (max 300 characters)'),
  // Optional — frontend "techCompanyNotAvailable" checkbox is stripped before sending;
  // if checked, techCompany may be absent or empty (no conditional check possible on backend)
  techCompany: z.string().max(100, 'Company name too long (max 100 characters)').optional().or(z.literal('')),
  // Range object { min, max } — single values have min === max
  cost: z.object({
    min: z.coerce.number().min(0, 'Amount must be at least 0'),
    max: z.coerce.number().min(0, 'Amount must be at least 0'),
  }),
  ownership: z.string()
    .min(1, 'Ownership is required')
    .refine((val) => OWNERSHIP_TYPES.includes(val), { message: 'Please select a valid ownership type' }),
  individualBusinessPlan: z.string().max(500, 'Too long (max 500 characters)').optional(),
  challenges: z.string().min(10, 'Please provide specific challenges (at least 10 characters)').max(500, 'Too long (max 500 characters)'),
  photosLink: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')),
}).refine((data) => {
  if (data.ownership === OWNERSHIP_INDIVIDUAL) {
    return !!data.individualBusinessPlan && data.individualBusinessPlan.length >= 1;
  }
  return true;
}, {
  message: 'Business plan is required',
  path: ['individualBusinessPlan'],
});

const createServiceRequestSchema = serviceRequestBodySchema;

const updateServiceRequestSchema = serviceRequestBodySchema.partial();

const aoCreateServiceRequestSchema = z.object({
  vleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid VLE ID'),
}).and(createServiceRequestSchema);

module.exports = {
  createServiceRequestSchema,
  updateServiceRequestSchema,
  aoCreateServiceRequestSchema,
};
