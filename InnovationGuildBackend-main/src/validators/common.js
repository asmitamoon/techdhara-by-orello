const { z } = require('zod');

// String validators (match frontend nameSchema / mobileSchema)
const nameSchema = z.string()
  .min(2, 'Must be at least 2 characters')
  .max(50, 'Name is too long (max 50 characters)')
  .regex(/^[a-zA-Z\s]*$/, 'Should only contain letters and spaces');

const mobileSchema = z.string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number');

// Number validators — backend receives already-transformed numbers from the frontend Zod transform
const ageSchema = z.number()
  .int('Age must be an integer')
  .min(10, 'Age must be at least 10')
  .max(100, 'Age must be at most 100');

// Factory: z.number().min(0, msg)
const positiveNumberSchema = (message) =>
  z.number().min(0, message || 'Must be a non-negative number');

// Nullable/optional number — used for optional numeric fields that can be null
const nullableNumberSchema = z.number().nullable().optional();

module.exports = { nameSchema, mobileSchema, ageSchema, positiveNumberSchema, nullableNumberSchema };
