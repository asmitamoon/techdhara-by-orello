import { z } from 'zod';
import { optionalNumericSchema } from './common';

const fieldCapacitySchema = z
  .string()
  .regex(/^\d*(\.\d+)?$/, "Must be a valid number")
  .transform(val => val === '' ? null : parseFloat(val))
  .nullable();

export const businessModelSchema = z.object({
  personaInterest: z.array(z.string()).min(1, "Select at least one persona"),
  assessmentReadiness: z.array(z.string()).optional(),

  // Rental Section
  initialCost: optionalNumericSchema,
  fieldCapacity: fieldCapacitySchema,
  customHiringCharges: optionalNumericSchema,
  estimatedRevenue: optionalNumericSchema,
  paybackPeriod: optionalNumericSchema,

  // Sales Section
  inventoryCosts: optionalNumericSchema,
  logisticsCosts: optionalNumericSchema,
  salesTargetYear: optionalNumericSchema,
  commissionsPlanned: optionalNumericSchema,
  estimatedRevenueSales: optionalNumericSchema,

  // Servicing Section
  servicingInventoryCosts: optionalNumericSchema,
  servicingLogisticsCosts: optionalNumericSchema,
  servicingTargetYear: optionalNumericSchema,
  servicingCommissionPlanned: optionalNumericSchema,

  // Fabrication Section
  machinesPlanned: optionalNumericSchema,
  costFabrication: optionalNumericSchema,
  sellingPrice: optionalNumericSchema,
  estimatedRevenueAssembly: optionalNumericSchema,
})
// Rental
.refine((data) => {
  if (data.personaInterest.includes('rental')) return data.initialCost !== null;
  return true;
}, { message: "Initial cost is required", path: ["initialCost"] })
.refine((data) => {
  if (data.personaInterest.includes('rental')) return data.fieldCapacity !== null;
  return true;
}, { message: "Field capacity is required", path: ["fieldCapacity"] })
.refine((data) => {
  if (data.personaInterest.includes('rental')) return data.customHiringCharges !== null;
  return true;
}, { message: "Custom hiring charges are required", path: ["customHiringCharges"] })
.refine((data) => {
  if (data.personaInterest.includes('rental')) return data.estimatedRevenue !== null;
  return true;
}, { message: "Estimated revenue is required", path: ["estimatedRevenue"] })
.refine((data) => {
  if (data.personaInterest.includes('rental')) return data.paybackPeriod !== null;
  return true;
}, { message: "Payback period is required", path: ["paybackPeriod"] })
// Sales
.refine((data) => {
  if (data.personaInterest.includes('sales')) return data.inventoryCosts !== null;
  return true;
}, { message: "Inventory costs are required", path: ["inventoryCosts"] })
.refine((data) => {
  if (data.personaInterest.includes('sales')) return data.logisticsCosts !== null;
  return true;
}, { message: "Logistics costs are required", path: ["logisticsCosts"] })
.refine((data) => {
  if (data.personaInterest.includes('sales')) return data.salesTargetYear !== null;
  return true;
}, { message: "Sales target is required", path: ["salesTargetYear"] })
.refine((data) => {
  if (data.personaInterest.includes('sales')) return data.commissionsPlanned !== null;
  return true;
}, { message: "Commissions planned is required", path: ["commissionsPlanned"] })
.refine((data) => {
  if (data.personaInterest.includes('sales')) return data.estimatedRevenueSales !== null;
  return true;
}, { message: "Estimated revenue is required", path: ["estimatedRevenueSales"] })
// Servicing
.refine((data) => {
  if (data.personaInterest.includes('servicing')) return data.servicingInventoryCosts !== null;
  return true;
}, { message: "Inventory costs are required", path: ["servicingInventoryCosts"] })
.refine((data) => {
  if (data.personaInterest.includes('servicing')) return data.servicingLogisticsCosts !== null;
  return true;
}, { message: "Logistics costs are required", path: ["servicingLogisticsCosts"] })
.refine((data) => {
  if (data.personaInterest.includes('servicing')) return data.servicingTargetYear !== null;
  return true;
}, { message: "Servicing target is required", path: ["servicingTargetYear"] })
.refine((data) => {
  if (data.personaInterest.includes('servicing')) return data.servicingCommissionPlanned !== null;
  return true;
}, { message: "Commission planned is required", path: ["servicingCommissionPlanned"] })
// Fabrication
.refine((data) => {
  if (data.personaInterest.includes('fabrication')) return data.machinesPlanned !== null;
  return true;
}, { message: "Number of machines is required", path: ["machinesPlanned"] })
.refine((data) => {
  if (data.personaInterest.includes('fabrication')) return data.costFabrication !== null;
  return true;
}, { message: "Cost of fabrication is required", path: ["costFabrication"] })
.refine((data) => {
  if (data.personaInterest.includes('fabrication')) return data.sellingPrice !== null;
  return true;
}, { message: "Selling price is required", path: ["sellingPrice"] })
.refine((data) => {
  if (data.personaInterest.includes('fabrication')) return data.estimatedRevenueAssembly !== null;
  return true;
}, { message: "Estimated revenue is required", path: ["estimatedRevenueAssembly"] });
