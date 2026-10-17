const { z } = require('zod');
const {
  BUSINESS_MODELS_ADOPTED,
  TECHNOLOGY_TYPES,
  TRAINING_STATUS,
  PERFORMANCE_RATINGS,
  EASE_RATINGS,
  RELIABILITY_RATINGS,
  SPARES_AVAILABILITY,
  OPERATIONAL_CHALLENGES,
  DOWNTIME_OPTIONS,
  SUPPORT_OPTIONS,
  RECOMMEND_OPTIONS,
} = require('../utils/constants/fieldReportConstants');

const fieldReportBodySchema = z.object({
  reportDate: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Report date must be in YYYY-MM-DD format'
  ),

  // Section 1: Basic Information
  businessModelAdopted: z.enum(BUSINESS_MODELS_ADOPTED, {
    errorMap: () => ({ message: 'Invalid business model selected' })
  }),
  typeOfTechnology: z.enum(TECHNOLOGY_TYPES, {
    errorMap: () => ({ message: 'Invalid technology type selected' })
  }),

  // Section 2: Training & Technical Performance
  receivedTraining: z.enum(TRAINING_STATUS, {
    errorMap: () => ({ message: 'Invalid training status selected' })
  }),
  machinePerformance: z.enum(PERFORMANCE_RATINGS, {
    errorMap: () => ({ message: 'Invalid machine performance rating' })
  }),
  easeOfOperation: z.enum(EASE_RATINGS, {
    errorMap: () => ({ message: 'Invalid ease of operation rating' })
  }),
  machineReliability: z.enum(RELIABILITY_RATINGS, {
    errorMap: () => ({ message: 'Invalid machine reliability rating' })
  }),
  availabilityOfSpares: z.enum(SPARES_AVAILABILITY, {
    errorMap: () => ({ message: 'Invalid spares availability option' })
  }),

  // Section 3: Operations & Maintenance
  easeOfMaintenance: z.enum(EASE_RATINGS, {
    errorMap: () => ({ message: 'Invalid ease of maintenance rating' })
  }),
  operationalChallenges: z.array(
    z.enum(OPERATIONAL_CHALLENGES, {
      errorMap: () => ({ message: 'Invalid operational challenge option' })
    })
  ).min(1, 'Please select at least one operational challenge'),
  downtimeExperience: z.enum(DOWNTIME_OPTIONS, {
    errorMap: () => ({ message: 'Invalid downtime experience option' })
  }),
  additionalComments: z.string().max(500, 'Comments must be 500 characters or less').optional(),

  // Section 4: Support & Ecosystem
  supportReceived: z.enum(SUPPORT_OPTIONS, {
    errorMap: () => ({ message: 'Invalid support received option' })
  }),
  supportNeeded: z.enum(SUPPORT_OPTIONS, {
    errorMap: () => ({ message: 'Invalid support needed option' })
  }),

  // Section 5: Future Outlook
  recommendToOthers: z.enum(RECOMMEND_OPTIONS, {
    errorMap: () => ({ message: 'Invalid recommendation option' })
  }),
  improvementSuggestions: z.string().max(500, 'Suggestions must be 500 characters or less').optional(),
});

const createFieldReportSchema = fieldReportBodySchema;

const getAllFieldReportsSchema = z.object({
  pilotId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid pilot ID format').optional(),
  createdBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid AO ID format').optional(),
  vleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid VLE ID format').optional(),
  innovationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid innovation ID format').optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'From date must be in YYYY-MM-DD format').optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'To date must be in YYYY-MM-DD format').optional(),
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .pipe(z.number().min(1))
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default('50'),
  sortBy: z.enum(['createdAt', 'reportDate']).default('reportDate'),
  order: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  createFieldReportSchema,
  getAllFieldReportsSchema
};
