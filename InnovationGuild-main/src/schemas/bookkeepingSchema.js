import { z } from 'zod';
import { optionalNumericSchema } from './common';
import { RENTAL_TYPES } from '../utils/constants/businessModelConstants';

export const createBookkeepingSchema = (selectedPersonas = []) => {
  const hasSales = selectedPersonas.includes('sales');
  const hasServicing = selectedPersonas.includes('servicing');
  const hasRental = selectedPersonas.includes('rental');
  const hasFabrication = selectedPersonas.includes('fabrication');

  return z.object({
    selectedDate: z.date().refine(d => d <= new Date(), { message: "Date cannot be in the future" }),
    selectedPeriod: z.enum(['Daily', 'Monthly', 'Yearly']),

    // Sales
    unitsSold: optionalNumericSchema,
    pricePerUnit: optionalNumericSchema,

    // Service
    unitsServiced: optionalNumericSchema,
    servicingType: z.string().min(3, "Please enter at least 3 characters").max(50, "Too long (max 50 characters)").or(z.literal('')),
    avgServiceCharge: optionalNumericSchema,
    sparesReplaced: z.string().min(3, "Please enter at least 3 characters").max(200, "Too long (max 200 characters)").or(z.literal('')),
    spareEarnings: optionalNumericSchema,

    // Rental
    rentalType: z.enum(RENTAL_TYPES)
      .nullable()
      .optional(),
    rentalCount: optionalNumericSchema,
    rentalUsers: optionalNumericSchema,
    rentalCharge: optionalNumericSchema,

    // Fabrication
    fabricationUnits: optionalNumericSchema,
    fabricationCost: optionalNumericSchema,
    fabricationSellingPrice: optionalNumericSchema,
    fabricationSold: optionalNumericSchema,
  })
  // Sales
  .refine(d => !hasSales || d.unitsSold !== null, { message: "Units sold is required", path: ["unitsSold"] })
  .refine(d => !hasSales || d.pricePerUnit !== null, { message: "Price per unit is required", path: ["pricePerUnit"] })
  // Service
  .refine(d => !hasServicing || d.unitsServiced !== null, { message: "Units serviced is required", path: ["unitsServiced"] })
  .refine(d => !hasServicing || !!d.servicingType, { message: "Servicing type is required", path: ["servicingType"] })
  .refine(d => !hasServicing || d.avgServiceCharge !== null, { message: "Service charge is required", path: ["avgServiceCharge"] })
  .refine(d => !hasServicing || !!d.sparesReplaced, { message: "Spares replaced is required", path: ["sparesReplaced"] })
  .refine(d => !hasServicing || d.spareEarnings !== null, { message: "Spare earnings is required", path: ["spareEarnings"] })
  // Rental
  .refine(d => !hasRental || d.rentalType != null, { message: "Please select a rental type", path: ["rentalType"] })
  .refine(d => !hasRental || d.rentalCount !== null, { message: "Rental count is required", path: ["rentalCount"] })
  .refine(d => !hasRental || d.rentalUsers !== null, { message: "Number of users is required", path: ["rentalUsers"] })
  .refine(d => !hasRental || d.rentalCharge !== null, { message: "Rental charge is required", path: ["rentalCharge"] })
  // Fabrication
  .refine(d => !hasFabrication || d.fabricationUnits !== null, { message: "Units fabricating is required", path: ["fabricationUnits"] })
  .refine(d => !hasFabrication || d.fabricationCost !== null, { message: "Fabrication cost is required", path: ["fabricationCost"] })
  .refine(d => !hasFabrication || d.fabricationSellingPrice !== null, { message: "Selling price is required", path: ["fabricationSellingPrice"] })
  .refine(d => !hasFabrication || d.fabricationSold !== null, { message: "Units sold is required", path: ["fabricationSold"] });
};
