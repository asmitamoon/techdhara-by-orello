import { z } from 'zod';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const nameSchema = z
  .string()
  .min(2, "Must be at least 2 characters")
  .max(50, "Name is too long (max 50 characters)")
  .regex(/^[a-zA-Z\s]*$/, "Should only contain letters and spaces");

export const numericStringSchema = (message) => z
  .string()
  .min(1, message || "Required")
  .regex(/^\d+$/, "Must be a number")
  .transform(Number);

export const optionalNumericSchema = z
  .string()
  .regex(/^\d*$/, "Must be a number")
  .transform(val => val === '' ? null : Number(val))
  .nullable();

export const rangeStringSchema = (message) => z
  .string()
  .min(1, message || "Required")
  .regex(/^\d+(\s*-\s*\d+)?$/, "Enter a valid amount or range (e.g. 50000 or 50000-80000)")
  .refine(
    (val) => {
      const normalized = val.replace(/\s/g, '');
      if (normalized === "0" || normalized === "0-0") return false;
      if (normalized.includes('-')) {
        const [start, end] = normalized.split('-').map(Number);
        return start > 0 && end > 0 && start < end;
      }
      return Number(normalized) > 0;
    },
    { message: "Amount must be greater than zero. For ranges, ensure start is less than end" }
  )
  .transform(val => {
    const normalized = val.replace(/\s/g, '');
    if (normalized.includes('-')) {
      const [min, max] = normalized.split('-').map(Number);
      return { min, max };
    }
    const num = Number(normalized);
    return { min: num, max: num };
  });

export const mobileSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number");

export const ageSchema = z
  .string()
  .min(1, "Age is required")
  .regex(/^\d+$/, "Age must be a valid number")
  .transform(Number)
  .refine(val => val >= 10 && val <= 100, "Age must be between 10 and 100");

export const imageSchema = z
  .any()
  .refine((file) => !file || typeof file === 'string' || file?.size <= MAX_FILE_SIZE, `Max image size is 10MB.`)
  .refine(
    (file) => !file || typeof file === 'string' || ACCEPTED_IMAGE_TYPES.includes(file?.type),
    "Only .jpg, .jpeg, .png and .webp formats are supported."
  )
  .optional();
