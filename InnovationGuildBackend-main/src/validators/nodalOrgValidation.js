const { z } = require('zod');

const nodalOrgInitiateAoRegistrationSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
  confirmPassword: z.string().optional()
}).refine(
  (data) => data.email || data.phone,
  { message: 'Either email or phone must be provided' }
).refine(
  (data) => !(data.email && data.phone),
  { message: 'Provide either email or phone number, not both' }
).refine(
  (data) => {
    if (data.email) {
      return data.password && data.confirmPassword;
    }
    return true;
  },
  { message: 'Password and confirm password are required for email registration', path: ['password'] }
).refine(
  (data) => {
    if (data.email && data.password && data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  },
  { message: 'Passwords do not match', path: ['confirmPassword'] }
);

// Field names match exactly what the frontend AORegistration form sends to the API
const nodalOrgAoRegistrationSchema = z.object({
  // Auth identifier — used to locate the AO user created in step 1
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  // AO full name — stored on User model; optional because frontend sends pocName instead
  fullName: z.string().trim().optional(),

  // Profile fields — names match AoProfile model and frontend form
  orgName: z.string().trim().min(1, 'Organization name is required'),
  orgType: z.string().min(1, 'Organization type is required'),
  orgTypeOther: z.string().trim().optional().or(z.literal('')),
  streamOfWork: z.array(z.string().trim()).min(1, 'At least one stream of work is required'),
  streamOfWorkOther: z.string().trim().optional().or(z.literal('')),
  pocName: z.string().trim().min(1, 'POC name is required'),
  village: z.string().trim().min(1, 'Village is required'),
  district: z.string().trim().min(1, 'District is required'),
  state: z.string().trim().min(1, 'State is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric')
}).refine(
  (data) => data.email || data.phone,
  { message: 'Either email or phone must be provided' }
).refine(
  (data) => !(data.email && data.phone),
  { message: 'Provide either email or phone number, not both' }
);

const nodalOrgResendAoOtpSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
}).refine(
  (data) => data.email || data.phone,
  { message: 'Either email or phone must be provided' }
).refine(
  (data) => !(data.email && data.phone),
  { message: 'Provide either email or phone number, not both' }
);

const approveAoSchema = z.object({});

const rejectAoSchema = z.object({
  reason: z.string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason must not exceed 500 characters')
    .trim()
});

module.exports = {
  nodalOrgInitiateAoRegistrationSchema,
  nodalOrgResendAoOtpSchema,
  nodalOrgAoRegistrationSchema,
  approveAoSchema,
  rejectAoSchema
};
