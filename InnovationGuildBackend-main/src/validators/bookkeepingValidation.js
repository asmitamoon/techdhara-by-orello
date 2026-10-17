const { z } = require('zod');
const { REPORTING_PERIODS, RENTAL_TYPES } = require('../utils/constants/bookkeepingConstants');

const nullableNumber = z.number().min(0, 'Must be 0 or greater').nullable().optional();

const bookkeepingBodySchema = z.object({
  pilotId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid pilot ID format'),
  selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  selectedPeriod: z.enum(REPORTING_PERIODS, {
    errorMap: () => ({ message: 'Reporting period must be Daily, Monthly, or Yearly' })
  }),

  // Sales
  unitsSold: nullableNumber,
  pricePerUnit: nullableNumber,

  // Servicing
  unitsServiced: nullableNumber,
  servicingType: z.string().min(3, 'Must be at least 3 characters').max(50, 'Must be at most 50 characters').or(z.literal('')).nullable().optional(),
  avgServiceCharge: nullableNumber,
  sparesReplaced: z.string().min(3, 'Must be at least 3 characters').max(200, 'Must be at most 200 characters').or(z.literal('')).nullable().optional(),
  spareEarnings: nullableNumber,

  // Rental
  rentalType: z.enum(RENTAL_TYPES, {
    errorMap: () => ({ message: 'Invalid rental type selected' })
  }).nullable().optional(),
  rentalCount: nullableNumber,
  rentalUsers: nullableNumber,
  rentalCharge: nullableNumber,

  // Fabrication
  fabricationUnits: nullableNumber,
  fabricationCost: nullableNumber,
  fabricationSellingPrice: nullableNumber,
  fabricationSold: nullableNumber,
});

const createBookkeepingSchema = bookkeepingBodySchema;

const updateBookkeepingSchema = bookkeepingBodySchema.partial();

const getBookkeepingSchema = z.object({
  reportingPeriod: z.enum(REPORTING_PERIODS).optional(),
  pilotId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid pilot ID format').optional(),
  vleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid VLE ID format').optional(),
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
  sortBy: z.enum(['periodDate', 'reportingPeriod']).default('periodDate'),
  order: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  createBookkeepingSchema,
  updateBookkeepingSchema,
  getBookkeepingSchema
};
