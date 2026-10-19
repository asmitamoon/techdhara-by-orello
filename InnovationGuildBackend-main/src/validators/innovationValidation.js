const { z } = require('zod');
const {
  INNOVATION_CATEGORIES,
  INNOVATION_SUBCATEGORIES,
  INNOVATION_STAGES,
  POWER_SOURCES,
  RENEWABLE_ENERGY_TYPES,
  YES_NO,
  DISTRIBUTOR_NETWORK,
  ENGINE_POWER,
  MOTOR_POWER,
  RENEWABLE_POWER,
} = require('../utils/constants/innovationConstants');

const innovationBodySchema = z.object({
  innovationName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long (max 100 characters)'),
  yearLaunched: z.number()
    .min(1900, 'Year must be at least 1900')
    .max(new Date().getFullYear(), `Year cannot be in the future`),
  description: z.string().min(20, 'Description is too short (at least 20 characters)').max(3000, 'Too long'),
  category: z.array(
    z.string().refine((val) => INNOVATION_CATEGORIES.includes(val), { message: 'Please select from the available options' })
  ).min(1, 'Select at least one category').max(3, 'Select up to 3'),
  categoryOther: z.string()
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Only letters, numbers, spaces, and hyphens are allowed')
    .optional()
    .or(z.literal('')),
  subcategory: z.array(
    z.string().refine((val) => INNOVATION_SUBCATEGORIES.includes(val), { message: 'Please select from the available options' })
  ).min(1, 'Select at least one subcategory').max(3, 'Select up to 3'),
  subcategoryOther: z.string()
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Only letters, numbers, spaces, and hyphens are allowed')
    .optional()
    .or(z.literal('')),
  innovationStage: z.string()
    .min(1, 'Innovation stage is required')
    .refine((val) => INNOVATION_STAGES.includes(val), { message: 'Please select a valid innovation stage' }),
  salesLocation: z.array(z.string()).min(1, 'Select at least one state'),
  distributorNetwork: z.string()
    .min(1, 'Selection is required')
    .refine((val) => DISTRIBUTOR_NETWORK.includes(val), { message: 'Please select a valid option' }),
  sellingPrice: z.object({
    min: z.coerce.number(),
    max: z.coerce.number()
  }),
  manufacturingLocation: z.string().min(2, 'Manufacturing location is required').max(100, 'Too long (max 100 characters)'),
  importedParts: z.string().max(500, 'Too long (max 500 characters)').optional(),
  spareParts: z.string()
    .min(1, 'Selection is required')
    .refine((val) => YES_NO.includes(val), { message: 'Please select Yes or No' }),
  powerSource: z.string()
    .min(1, 'Power source is required')
    .refine((val) => POWER_SOURCES.includes(val), { message: 'Please select a valid power source' }),
  pullCapacity: z.string().max(50, 'Too long (max 50 characters)').optional(),
  engineCapacity: z.string().max(50, 'Too long (max 50 characters)').optional(),
  motorCapacity: z.string().max(50, 'Too long (max 50 characters)').optional(),
  renewableType: z.string()
    .refine((val) => !val || RENEWABLE_ENERGY_TYPES.includes(val), { message: 'Please select a valid renewable energy type' })
    .optional(),
  dimensions: z.string().min(1, 'Dimensions are required').max(500, 'Too long (max 500 characters)'),
  weight: z.string().min(1, 'Weight is required').max(50, 'Too long (max 50 characters)'),
  attachments: z.string().max(200, 'Too long (max 200 characters)').optional(),
  performanceParams: z.string().max(200, 'Too long (max 200 characters)').optional(),
  coveredOperations: z.array(
    z.string()
      .regex(/^[a-zA-Z0-9\s-_]+$/, 'Operation names can only contain letters, numbers, spaces, hyphens, and underscores')
      .transform(v => v.toLowerCase().trim())
  ).min(1, 'Select at least one operation').max(3, 'Select up to 3'),
  suitableCrops: z.string().max(200, 'Too long (max 200 characters)').optional(),
  suitableTerrains: z.string().max(500, 'Too long (max 500 characters)').optional(),
  suitableSoil: z.string().max(200, 'Too long (max 200 characters)').optional(),
  weatherConditions: z.string().max(200, 'Too long (max 200 characters)').optional(),
  otherUsageConditions: z.string().max(200, 'Too long (max 200 characters)').optional(),
  maintenanceTraining: z.string()
    .min(1, 'Selection is required')
    .refine((val) => YES_NO.includes(val), { message: 'Please select Yes or No' }),
  financingSupport: z.string()
    .min(1, 'Selection is required')
    .refine((val) => ['yes', 'no', 'open_to_explore', 'not_needed'].includes(val), { message: 'Please select a valid option' }),
  technicalTraining: z.string()
    .min(1, 'Selection is required')
    .refine((val) => ['yes', 'no', 'not_needed'].includes(val), { message: 'Please select a valid option' }),
  demoInstallations: z.string()
    .min(1, 'Selection is required')
    .refine((val) => YES_NO.includes(val), { message: 'Please select Yes or No' }),
}).superRefine((data, ctx) => {
  // pullCapacity is optional — frontend has a "not known" checkbox that strips the field before sending
  if (ENGINE_POWER.includes(data.powerSource)) {
    if (!data.engineCapacity || data.engineCapacity.length < 1) {
      ctx.addIssue({ code: 'custom', message: 'Engine capacity is required', path: ['engineCapacity'] });
    }
  }
  if (MOTOR_POWER.includes(data.powerSource)) {
    if (!data.motorCapacity || data.motorCapacity.length < 1) {
      ctx.addIssue({ code: 'custom', message: 'Motor capacity is required', path: ['motorCapacity'] });
    }
  }
  if (RENEWABLE_POWER.includes(data.powerSource)) {
    if (!data.renewableType || data.renewableType.length < 1) {
      ctx.addIssue({ code: 'custom', message: 'Please select a renewable energy type', path: ['renewableType'] });
    }
  }
  if (data.category && data.category.includes('others')) {
    if (!data.categoryOther || data.categoryOther.trim().length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Please specify the category', path: ['categoryOther'] });
    }
  }
  if (data.subcategory && data.subcategory.includes('others')) {
    if (!data.subcategoryOther || data.subcategoryOther.trim().length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Please specify the subcategory', path: ['subcategoryOther'] });
    }
  }
});

const createInnovationSchema = innovationBodySchema;

const updateInnovationSchema = innovationBodySchema.partial();

module.exports = {
  createInnovationSchema,
  updateInnovationSchema
};
