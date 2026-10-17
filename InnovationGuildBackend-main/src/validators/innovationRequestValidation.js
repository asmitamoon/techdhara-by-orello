const { z } = require('zod');
const { YES_NO, POWER_SOURCES } = require('../utils/constants/innovationConstants');
const {
  PROBLEM_CATEGORIES,
  PROBLEM_SUBCATEGORIES,
} = require('../utils/constants/problemConstants');

const innovationRequestBodySchema = z.object({
  problemTitle: z.string().min(5, 'Title is too short').max(100, 'Too long'),
  problemDescription: z.string().min(20, 'Please provide more details (at least 20 characters)').max(3000, 'Too long'),
  regionState: z.string().min(1, 'State is required'),
  regionDistrict: z.string().min(1, 'District is required'),
  regionVillage: z.string().min(2, 'Village/City is required').max(50, 'Too long (max 50 characters)'),
  // category: '' when 'others' was selected (frontend transform), or a valid PROBLEM_CATEGORIES value
  category: z.string()
    .refine(
      (val) => val === '' || PROBLEM_CATEGORIES.includes(val),
      { message: 'Please select a valid vertical' }
    ),
  categoryOther: z.string()
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Only letters, numbers, spaces, and hyphens are allowed')
    .optional()
    .or(z.literal('')),
  valueChainStages: z.array(
    z.string().refine(
      (val) => PROBLEM_SUBCATEGORIES.includes(val),
      { message: 'Please select from the available options' }
    )
  ).min(1, 'Select at least one stage'),
  crops: z.string().min(2, 'This field is required').max(50, 'Too long (max 50 characters)'),
  operationsUndertaken: z.array(z.string().transform(v => v.toLowerCase().trim())).min(1, 'Select at least one operation').max(10, 'Maximum 10 operations allowed'),
  machineOperations: z.array(z.string().transform(v => v.toLowerCase().trim())).min(1, 'Select at least one operation').max(10, 'Maximum 10 operations allowed'),
  currentMethodology: z.string().min(10, 'Please describe the methodology (at least 10 characters)').max(500, 'Too long (max 500 characters)'),
  knowMachinery: z.string().refine((val) => YES_NO.includes(val), {
    message: 'Please select an option',
  }),
  machineChallenge: z.string().max(500, 'Too long (max 500 characters)').optional(),
  energySource: z.array(
    z.string().refine(val => POWER_SOURCES.includes(val), { message: 'Invalid energy source value' })
  ).min(1, 'Select preferred energy source'),
  // pullCapacity is optional — frontend has a "not known" checkbox that strips the flag before sending;
  // if checked, pullCapacity may be absent from the payload
  pullCapacity: z.string().optional(),
  engineCapacity: z.string().optional(),
  motorCapacity: z.string().optional(),
  renewableType: z.string().optional(),
  specificInfo: z.string().max(200, 'Too long (max 200 characters)').optional(),
  problemSize: z.string().min(1, 'Problem size estimate is required').max(100, 'Too long (max 100 characters)'),
  endProducts: z.string().min(1, 'End products info is required').max(200, 'Too long (max 200 characters)'),
  salesChannels: z.string().min(1, 'Sales channels info is required').max(200, 'Too long (max 200 characters)'),
  newChannels: z.string().min(1, 'New channels info is required').max(200, 'Too long (max 200 characters)'),
  // Coerced from string — FormData sends all values as strings
  currentRevenue: z.coerce.number().positive('Amount must be greater than zero'),
  expectedRevenue: z.coerce.number().positive('Amount must be greater than zero'),
  machineBudget: z.coerce.number().positive('Amount must be greater than zero'),
}).refine((data) => {
  // category is '' when 'others' was selected (frontend transform)
  if (data.category === '') {
    return !!data.categoryOther && data.categoryOther.length >= 2;
  }
  return true;
}, {
  message: 'Please specify the vertical',
  path: ['categoryOther'],
}).refine((data) => {
  if (data.knowMachinery === 'yes') {
    return !!data.machineChallenge && data.machineChallenge.length >= 5;
  }
  return true;
}, {
  message: 'Please describe the challenge (at least 5 characters)',
  path: ['machineChallenge'],
}).refine((data) => {
  if (data.energySource.includes('petrol_diesel')) {
    return !!data.engineCapacity && data.engineCapacity.length >= 1;
  }
  return true;
}, {
  message: 'Engine capacity is required',
  path: ['engineCapacity'],
}).refine((data) => {
  if (data.energySource.includes('electrical') || data.energySource.includes('renewable')) {
    return !!data.motorCapacity && data.motorCapacity.length >= 1;
  }
  return true;
}, {
  message: 'Motor capacity is required',
  path: ['motorCapacity'],
}).refine((data) => {
  if (data.energySource.includes('renewable')) {
    return !!data.renewableType && data.renewableType.length >= 1;
  }
  return true;
}, {
  message: 'Please select a renewable energy type',
  path: ['renewableType'],
});

const createInnovationRequestSchema = innovationRequestBodySchema;

const updateInnovationRequestSchema = innovationRequestBodySchema.partial();

module.exports = {
  createInnovationRequestSchema,
  updateInnovationRequestSchema,
};
