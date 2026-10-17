import { z } from 'zod';
import { imageSchema, numericStringSchema, rangeStringSchema } from './common';
import { YES_NO } from '../utils/constants/innovationConstants';
import {
  PROBLEM_CATEGORIES,
  PROBLEM_SUBCATEGORIES,
  UNIT_TYPES,
  OWNERSHIP_TYPES,
  OWNERSHIP_INDIVIDUAL,
} from '../utils/constants/problemConstants';

export const innovationRequestSchema = z.object({
  problemTitle: z.string().min(5, "Title is too short").max(100, "Too long"),
  problemDescription: z.string().min(20, "Please provide more details (at least 20 characters)").max(3000, "Too long"),
  regionState: z.string().min(1, "State is required"),
  regionDistrict: z.string().min(1, "District is required"),
  regionVillage: z.string().min(2, "Village/City is required").max(50, "Too long (max 50 characters)"),
  category: z.string()
    .min(1, "Vertical is required")
    .refine(
      (val) => PROBLEM_CATEGORIES.includes(val),
      { message: "Please select a valid vertical" }
    ),
  categoryOther: z.string()
    .regex(/^[a-zA-Z0-9\s-]+$/, "Only letters, numbers, spaces, and hyphens are allowed")
    .optional()
    .or(z.literal('')),
  valueChainStages: z.array(z.string().refine(
    (val) => PROBLEM_SUBCATEGORIES.includes(val),
    { message: "Please select from the available options" }
  )).min(1, "Select at least one stage"),
  crops: z.string().min(2, "This field is required").max(50, "Too long (max 50 characters)"),
  operationsUndertaken: z.array(z.string().transform(v => v.toLowerCase().trim())).min(1, "Select at least one operation").max(10, "Maximum 10 operations allowed"),
  machineOperations: z.array(z.string().transform(v => v.toLowerCase().trim())).min(1, "Select at least one operation").max(10, "Maximum 10 operations allowed"),
  currentMethodology: z.string().min(10, "Please describe the methodology (at least 10 characters)").max(500, "Too long (max 500 characters)"),
  knowMachinery: z.enum(YES_NO).nullable().refine(val => val !== null, {
    message: "Please select an option",
  }),
  machineChallenge: z.string().max(500, "Too long (max 500 characters)").optional(),
  energySource: z.array(z.string()).min(1, "Select preferred energy source"),
  pullCapacity: z.string().optional(),
  pullCapacityNotKnown: z.boolean().optional(),
  engineCapacity: z.string().optional(),
  motorCapacity: z.string().optional(),
  renewableType: z.string().optional(),
  specificInfo: z.string().max(200, "Too long (max 200 characters)").optional(),
  problemSize: z.string().min(1, "Problem size estimate is required").max(100, "Too long (max 100 characters)"),
  endProducts: z.string().min(1, "End products info is required").max(200, "Too long (max 200 characters)"),
  salesChannels: z.string().min(1, "Sales channels info is required").max(200, "Too long (max 200 characters)"),
  newChannels: z.string().min(1, "New channels info is required").max(200, "Too long (max 200 characters)"),
  currentRevenue: numericStringSchema("Current revenue is required").refine(val => val > 0, "Amount must be greater than zero"),
  expectedRevenue: numericStringSchema("Expected revenue is required").refine(val => val > 0, "Amount must be greater than zero"),
  machineBudget: numericStringSchema("Budget is required").refine(val => val > 0, "Amount must be greater than zero"),
  uploadedImage: imageSchema,
}).refine((data) => {
  if (data.category === 'others') {
    return !!data.categoryOther && data.categoryOther.length >= 2;
  }
  return true;
}, {
  message: "Please specify the vertical",
  path: ["categoryOther"],
}).refine((data) => {
  if (data.knowMachinery === 'yes') {
    return !!data.machineChallenge && data.machineChallenge.length >= 5;
  }
  return true;
}, {
  message: "Please describe the challenge (at least 5 characters)",
  path: ["machineChallenge"],
}).refine((data) => {
  if ((data.energySource.includes('manual') || data.energySource.includes('bullock')) && !data.pullCapacityNotKnown) {
    return !!data.pullCapacity && data.pullCapacity.length >= 1;
  }
  return true;
}, {
  message: "Pull capacity is required",
  path: ["pullCapacity"],
}).refine((data) => {
  if (data.energySource.includes('petrol_diesel')) {
    return !!data.engineCapacity && data.engineCapacity.length >= 1;
  }
  return true;
}, {
  message: "Engine capacity is required",
  path: ["engineCapacity"],
}).refine((data) => {
  if (data.energySource.includes('electrical') || data.energySource.includes('renewable')) {
    return !!data.motorCapacity && data.motorCapacity.length >= 1;
  }
  return true;
}, {
  message: "Motor capacity is required",
  path: ["motorCapacity"],
}).refine((data) => {
  if (data.energySource.includes('renewable')) {
    return !!data.renewableType && data.renewableType.length >= 1;
  }
  return true;
}, {
  message: "Please select a renewable energy type",
  path: ["renewableType"],
}).transform((data) => {
  const { pullCapacityNotKnown, ...rest } = data;
  return {
    ...rest,
    category: data.category === 'others' ? '' : data.category,
    categoryOther: data.category === 'others' ? data.categoryOther : '',
  };
});

export const serviceRequestSchema = z.object({
  unitType: z.string()
    .min(1, "Unit type is required")
    .refine(
      (val) => UNIT_TYPES.includes(val),
      { message: "Please select a valid unit type" }
    ),
  techName: z.string().min(2, "Technology name is required").max(100, "Name is too long (max 100 characters)"),
  techSpecs: z.string().min(5, "Please provide basic specs").max(300, "Too long (max 300 characters)"),
  techCompany: z.string().max(100, "Company name too long (max 100 characters)").optional().or(z.literal('')),
  techCompanyNotAvailable: z.boolean().optional(),
  cost: rangeStringSchema("Cost is required"),
  ownership: z.string()
    .min(1, "Ownership is required")
    .refine(
      (val) => OWNERSHIP_TYPES.includes(val),
      { message: "Please select a valid ownership type" }
    ),
  individualBusinessPlan: z.string().max(500, "Too long (max 500 characters)").optional(),
  challenges: z.string().min(10, "Please provide specific challenges (at least 10 characters)").max(500, "Too long (max 500 characters)"),
  photosLink: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
}).refine((data) => {
  if (data.ownership === OWNERSHIP_INDIVIDUAL) {
    return !!data.individualBusinessPlan && data.individualBusinessPlan.length >= 1;
  }
  return true;
}, {
  message: "Business plan is required",
  path: ["individualBusinessPlan"],
}).refine((data) => {
  if (!data.techCompanyNotAvailable) {
    return !!data.techCompany && data.techCompany.length >= 1;
  }
  return true;
}, {
  message: "Technology company name is required",
  path: ["techCompany"],
}).transform((data) => {
  const { techCompanyNotAvailable, ...rest } = data;
  return rest;
});
