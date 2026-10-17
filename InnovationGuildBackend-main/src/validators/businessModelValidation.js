const { z } = require('zod');
const { BUSINESS_MODEL_PERSONAS } = require('../utils/constants/businessModelConstants');

// Frontend null-strips before sending, so absent fields arrive as undefined.
// .nullish() = .nullable().optional() → accepts number | null | undefined
const nullableNumber = z.number().min(0, 'Must be 0 or greater').nullish();

const businessModelBodySchema = z.object({
  pilotId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid pilot ID format'),
  personaInterest: z.array(
    z.string().refine((val) => BUSINESS_MODEL_PERSONAS.includes(val), {
      message: 'Invalid persona selected',
    })
  ).min(1, 'Select at least one persona'),
  assessmentReadiness: z.array(z.string()).optional(),

  // Rental fields
  initialCost: nullableNumber,
  fieldCapacity: nullableNumber,
  customHiringCharges: nullableNumber,
  estimatedRevenue: nullableNumber,
  paybackPeriod: nullableNumber,

  // Sales fields
  inventoryCosts: nullableNumber,
  logisticsCosts: nullableNumber,
  salesTargetYear: nullableNumber,
  commissionsPlanned: nullableNumber,
  estimatedRevenueSales: nullableNumber,

  // Servicing fields
  servicingInventoryCosts: nullableNumber,
  servicingLogisticsCosts: nullableNumber,
  servicingTargetYear: nullableNumber,
  servicingCommissionPlanned: nullableNumber,

  // Fabrication fields
  machinesPlanned: nullableNumber,
  costFabrication: nullableNumber,
  sellingPrice: nullableNumber,
  estimatedRevenueAssembly: nullableNumber,
})
// Rental refines
.refine((data) => {
  if (data.personaInterest.includes('rental')) return data.initialCost != null;
  return true;
}, { message: 'Initial cost is required', path: ['initialCost'] })
.refine((data) => {
  if (data.personaInterest.includes('rental')) return data.fieldCapacity != null;
  return true;
}, { message: 'Field capacity is required', path: ['fieldCapacity'] })
.refine((data) => {
  if (data.personaInterest.includes('rental')) return data.customHiringCharges != null;
  return true;
}, { message: 'Custom hiring charges are required', path: ['customHiringCharges'] })
.refine((data) => {
  if (data.personaInterest.includes('rental')) return data.estimatedRevenue != null;
  return true;
}, { message: 'Estimated revenue is required', path: ['estimatedRevenue'] })
.refine((data) => {
  if (data.personaInterest.includes('rental')) return data.paybackPeriod != null;
  return true;
}, { message: 'Payback period is required', path: ['paybackPeriod'] })
// Sales refines
.refine((data) => {
  if (data.personaInterest.includes('sales')) return data.inventoryCosts != null;
  return true;
}, { message: 'Inventory costs are required', path: ['inventoryCosts'] })
.refine((data) => {
  if (data.personaInterest.includes('sales')) return data.logisticsCosts != null;
  return true;
}, { message: 'Logistics costs are required', path: ['logisticsCosts'] })
.refine((data) => {
  if (data.personaInterest.includes('sales')) return data.salesTargetYear != null;
  return true;
}, { message: 'Sales target is required', path: ['salesTargetYear'] })
.refine((data) => {
  if (data.personaInterest.includes('sales')) return data.commissionsPlanned != null;
  return true;
}, { message: 'Commissions planned is required', path: ['commissionsPlanned'] })
.refine((data) => {
  if (data.personaInterest.includes('sales')) return data.estimatedRevenueSales != null;
  return true;
}, { message: 'Estimated revenue is required', path: ['estimatedRevenueSales'] })
// Servicing refines
.refine((data) => {
  if (data.personaInterest.includes('servicing')) return data.servicingInventoryCosts != null;
  return true;
}, { message: 'Inventory costs are required', path: ['servicingInventoryCosts'] })
.refine((data) => {
  if (data.personaInterest.includes('servicing')) return data.servicingLogisticsCosts != null;
  return true;
}, { message: 'Logistics costs are required', path: ['servicingLogisticsCosts'] })
.refine((data) => {
  if (data.personaInterest.includes('servicing')) return data.servicingTargetYear != null;
  return true;
}, { message: 'Servicing target is required', path: ['servicingTargetYear'] })
.refine((data) => {
  if (data.personaInterest.includes('servicing')) return data.servicingCommissionPlanned != null;
  return true;
}, { message: 'Commission planned is required', path: ['servicingCommissionPlanned'] })
// Fabrication refines
.refine((data) => {
  if (data.personaInterest.includes('fabrication')) return data.machinesPlanned != null;
  return true;
}, { message: 'Number of machines is required', path: ['machinesPlanned'] })
.refine((data) => {
  if (data.personaInterest.includes('fabrication')) return data.costFabrication != null;
  return true;
}, { message: 'Cost of fabrication is required', path: ['costFabrication'] })
.refine((data) => {
  if (data.personaInterest.includes('fabrication')) return data.sellingPrice != null;
  return true;
}, { message: 'Selling price is required', path: ['sellingPrice'] })
.refine((data) => {
  if (data.personaInterest.includes('fabrication')) return data.estimatedRevenueAssembly != null;
  return true;
}, { message: 'Estimated revenue is required', path: ['estimatedRevenueAssembly'] });

const createBusinessModelSchema = businessModelBodySchema;

const updateBusinessModelSchema = businessModelBodySchema.partial();

const getBusinessModelsSchema = z.object({
  innovationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid innovation ID format').optional(),
  pilotId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid pilot ID format').optional(),
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .pipe(z.number().min(1))
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .pipe(z.number().min(1).max(50))
    .default('20')
});

module.exports = {
  createBusinessModelSchema,
  updateBusinessModelSchema,
  getBusinessModelsSchema
};
