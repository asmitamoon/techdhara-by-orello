import { z } from 'zod';
import { vleBaseSchema, applyVleRefines, vleTransformFn } from './registrationSchema';
import { nameSchema, mobileSchema } from './common';

const adminVleBaseSchema = vleBaseSchema.extend({
  trainings: z.array(z.enum(['basic', 'innovation', 'advanced', 'other'])).optional(),
  basicTrainingCenter: z.string().max(100, "Too long (max 100 characters)").optional().or(z.literal('')),
  innovationTrainingCenter: z.string().max(100, "Too long (max 100 characters)").optional().or(z.literal('')),
  advancedTrainingCenter: z.string().max(100, "Too long (max 100 characters)").optional().or(z.literal('')),
  otherTrainingCenter: z.string().max(100, "Too long (max 100 characters)").optional().or(z.literal('')),
});

export const adminVleSchema = applyVleRefines(adminVleBaseSchema)
  // Training center refines (admin-only)
  .refine((data) => {
    if (data.trainings?.includes('basic')) return !!data.basicTrainingCenter && data.basicTrainingCenter.trim().length > 0;
    return true;
  }, { message: "Please specify the training center", path: ["basicTrainingCenter"] })
  .refine((data) => {
    if (data.trainings?.includes('innovation')) return !!data.innovationTrainingCenter && data.innovationTrainingCenter.trim().length > 0;
    return true;
  }, { message: "Please specify the training center", path: ["innovationTrainingCenter"] })
  .refine((data) => {
    if (data.trainings?.includes('advanced')) return !!data.advancedTrainingCenter && data.advancedTrainingCenter.trim().length > 0;
    return true;
  }, { message: "Please specify the training center", path: ["advancedTrainingCenter"] })
  .refine((data) => {
    if (data.trainings?.includes('other')) return !!data.otherTrainingCenter && data.otherTrainingCenter.trim().length > 0;
    return true;
  }, { message: "Please specify the training center", path: ["otherTrainingCenter"] })
  .transform(vleTransformFn);

export const pipelineInnovatorSchema = z.object({
  name: nameSchema,
  enterprise: z.string().min(2, "Enterprise name is required").max(100, "Too long (max 100 characters)"),
  emailId: z.string().min(1, "Email is required").email("Please enter a valid email address").max(100, "Too long (max 100 characters)"),
  mobile: mobileSchema,
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  link: z.string().url("Please enter a valid URL (e.g. https://example.com)").optional().or(z.literal('')),
});
