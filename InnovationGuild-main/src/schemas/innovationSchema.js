import { z } from 'zod';
import { rangeStringSchema } from './common';
import {
  INNOVATION_CATEGORIES,
  INNOVATION_SUBCATEGORIES,
  INNOVATION_STAGES,
  POWER_SOURCES,
  RENEWABLE_ENERGY_TYPES,
  YES_NO,
  DISTRIBUTOR_NETWORK,
  MANUAL_POWER,
  ENGINE_POWER,
  MOTOR_POWER,
  RENEWABLE_POWER,
} from '../utils/constants/innovationConstants';

export const innovationSchema = z.object({
  innovationName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long (max 100 characters)"),
  yearLaunched: z.string()
    .min(1, "Year launched is required")
    .regex(/^\d+$/, "Must be a number")
    .length(4, "Must be a valid 4-digit year")
    .superRefine((val, ctx) => {
      const year = parseInt(val, 10);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        ctx.addIssue({
          code: 'custom',
          message: `Year must be between 1900 and ${currentYear}`,
        });
      }
    })
    .transform(Number),
  description: z.string().min(20, "Description is too short (at least 20 characters)").max(3000, "Too long"),
  category: z.array(z.string().refine(
    (val) => INNOVATION_CATEGORIES.includes(val),
    { message: "Please select from the available options" }
  )).min(1, "Select at least one category").max(3, "Select up to 3"),
  categoryOther: z.string()
    .regex(/^[a-zA-Z0-9\s-]+$/, "Only letters, numbers, spaces, and hyphens are allowed")
    .optional()
    .or(z.literal('')),
  subcategory: z.array(z.string().refine(
    (val) => INNOVATION_SUBCATEGORIES.includes(val),
    { message: "Please select from the available options" }
  )).min(1, "Select at least one subcategory").max(3, "Select up to 3"),
  subcategoryOther: z.string()
    .regex(/^[a-zA-Z0-9\s-]+$/, "Only letters, numbers, spaces, and hyphens are allowed")
    .optional()
    .or(z.literal('')),
  innovationStage: z.string()
    .min(1, "Innovation stage is required")
    .refine(
      (val) => INNOVATION_STAGES.includes(val),
      { message: "Please select a valid innovation stage" }
    ),
  salesLocation: z.array(z.string()).min(1, "Select at least one state"),
  distributorNetwork: z.string()
    .min(1, "Selection is required")
    .refine(
      (val) => DISTRIBUTOR_NETWORK.includes(val),
      { message: "Please select a valid option" }
    ),
  sellingPrice: rangeStringSchema("Selling price is required"),
  manufacturingLocation: z.string().min(2, "Manufacturing location is required").max(100, "Too long (max 100 characters)"),
  importedParts: z.string().max(500, "Too long (max 500 characters)").optional(),
  importedPartsNotApplicable: z.boolean().optional(),
  spareParts: z.string()
    .min(1, "Selection is required")
    .refine(
      (val) => YES_NO.includes(val),
      { message: "Please select Yes or No" }
    ),
  powerSource: z.string()
    .min(1, "Power source is required")
    .refine(
      (val) => POWER_SOURCES.includes(val),
      { message: "Please select a valid power source" }
    ),
  // Conditional fields based on powerSource - validated via superRefine() below
  pullCapacity: z.string().max(50, "Too long (max 50 characters)").optional(),
  pullCapacityNotKnown: z.boolean().optional(),
  engineCapacity: z.string().max(50, "Too long (max 50 characters)").optional(),
  motorCapacity: z.string().max(50, "Too long (max 50 characters)").optional(),
  renewableType: z.string()
    .refine(
      (val) => !val || RENEWABLE_ENERGY_TYPES.includes(val),
      { message: "Please select a valid renewable energy type" }
    )
    .optional(),
  dimensions: z.string().min(1, "Dimensions are required").max(500, "Too long (max 500 characters)"),
  weight: z.string().min(1, "Weight is required").max(50, "Too long (max 50 characters)"),
  attachments: z.string().max(200, "Too long (max 200 characters)").optional(),
  performanceParams: z.string().max(200, "Too long (max 200 characters)").optional(),
  coveredOperations: z.array(z.string().regex(
    /^[a-zA-Z0-9\s-_]+$/,
    "Operation names can only contain letters, numbers, spaces, hyphens, and underscores"
  ).transform(v => v.toLowerCase().trim())).min(1, "Select at least one operation").max(3, "Select up to 3"),
  suitableCrops: z.string().max(200, "Too long (max 200 characters)").optional(),
  suitableTerrains: z.string().max(500, "Too long (max 500 characters)").optional(),
  suitableSoil: z.string().max(200, "Too long (max 200 characters)").optional(),
  weatherConditions: z.string().max(200, "Too long (max 200 characters)").optional(),
  otherUsageConditions: z.string().max(200, "Too long (max 200 characters)").optional(),
  maintenanceTraining: z.string()
    .min(1, "Selection is required")
    .refine(
      (val) => YES_NO.includes(val),
      { message: "Please select Yes or No" }
    ),
  financingSupport: z.string()
    .min(1, "Selection is required")
    .refine(
      (val) => ['yes', 'no', 'open_to_explore', 'not_needed'].includes(val),
      { message: "Please select a valid option" }
    ),
  technicalTraining: z.string()
    .min(1, "Selection is required")
    .refine(
      (val) => ['yes', 'no', 'not_needed'].includes(val),
      { message: "Please select a valid option" }
    ),
  demoInstallations: z.string()
    .min(1, "Selection is required")
    .refine(
      (val) => YES_NO.includes(val),
      { message: "Please select Yes or No" }
    ),
  mediaItems: z.array(z.any()).min(1, "Upload at least one media item"),
  otherDocuments: z.array(z.any()).optional(),
}).superRefine((data, ctx) => {
  // Consolidated conditional validation using superRefine for better maintainability

  // Manual/Bullock → pullCapacity required (unless "not known" checked)
  if (MANUAL_POWER.includes(data.powerSource) && !data.pullCapacityNotKnown) {
    if (!data.pullCapacity || data.pullCapacity.length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Pull capacity is required",
        path: ["pullCapacity"]
      });
    }
  }

  // Petrol/Diesel → engineCapacity required
  if (ENGINE_POWER.includes(data.powerSource)) {
    if (!data.engineCapacity || data.engineCapacity.length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Engine capacity is required",
        path: ["engineCapacity"]
      });
    }
  }

  // Electrical/Renewable → motorCapacity required
  if (MOTOR_POWER.includes(data.powerSource)) {
    if (!data.motorCapacity || data.motorCapacity.length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Motor capacity is required",
        path: ["motorCapacity"]
      });
    }
  }

  // Renewable → renewableType required
  if (RENEWABLE_POWER.includes(data.powerSource)) {
    if (!data.renewableType || data.renewableType.length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Please select a renewable energy type",
        path: ["renewableType"]
      });
    }
  }

  // Category "others" → categoryOther required
  if (data.category.includes('others')) {
    if (!data.categoryOther || data.categoryOther.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Please specify the category",
        path: ["categoryOther"]
      });
    }
  }

  // Subcategory "others" → subcategoryOther required
  if (data.subcategory.includes('others')) {
    if (!data.subcategoryOther || data.subcategoryOther.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Please specify the subcategory",
        path: ["subcategoryOther"]
      });
    }
  }

  // Ensure at least 1 image in mediaItems
  const hasImage = data.mediaItems.some(item =>
    item.fileType === 'image' ||
    (item.type === 'file' && item.file?.type?.startsWith('image/'))
  );
  if (!hasImage) {
    ctx.addIssue({
      code: "custom",
      message: "Upload at least 1 image (required for thumbnail)",
      path: ["mediaItems"]
    });
  }

  // Imported parts → required unless "not applicable" is checked
  if (!data.importedPartsNotApplicable) {
    if (!data.importedParts || data.importedParts.trim().length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Please specify imported parts or check 'Not applicable'",
        path: ["importedParts"]
      });
    }
  }
}).transform((data) => {
  const { importedPartsNotApplicable, pullCapacityNotKnown, ...rest } = data;
  return {
    ...rest,
    category: data.category.filter(c => c !== 'others'),
    subcategory: data.subcategory.filter(c => c !== 'others'),
  };
});