const { z } = require('zod');
const { roleEnum } = require('./commonValidation');

const passwordRules = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const registerSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: passwordRules,
  confirmPassword: z.string(),
  role: roleEnum
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z.string().trim().optional(),
  password: z.string().min(1, 'Password is required')
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email']
});

const mobileLoginSchema = z.object({
  phone: z.string().trim(),
  password: passwordRules,
  confirmPassword: z.string(),
  role: z.enum(['VLE', 'INNOVATOR', 'NO', 'AO', 'GENERAL_USER'], {
    errorMap: () => ({ message: 'Invalid role. Allowed roles: VLE, INNOVATOR, NO, AO, GENERAL_USER' })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

const verifyOTPSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z.string()
    .trim()
    .optional(),
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits')
}).refine(
  (data) => data.email || data.phone,
  { message: 'Either email or phone must be provided' }
);

const mobileVerifySchema = z.object({
  phone: z.string().trim(),
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits')
});

const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z.string().trim().optional()
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email']
});

const verifyResetOTPSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z.string().trim().optional(),
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits')
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email']
});

const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: passwordRules
});

const resendOTPSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z.string()
    .trim()
    .optional()
}).refine(
  (data) => data.email || data.phone,
  { message: 'Either email or phone must be provided' }
);

module.exports = {
  registerSchema,
  loginSchema,
  mobileLoginSchema,
  verifyOTPSchema,
  verifyResetOTPSchema,
  mobileVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOTPSchema
};
