const { z } = require('zod');
const { nameSchema, mobileSchema, ageSchema, positiveNumberSchema, nullableNumberSchema } = require('./common');

const aoInitiateVleRegistrationSchema = z.object({
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

const aoResendVleOtpSchema = z.object({
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

// Field names match exactly what the frontend vleSchema transform sends to the API
const vleRegistrationSchema = z.object({
  fullName: nameSchema,
  mobile: mobileSchema,
  age: ageSchema,
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gender must be male, female, or other' })
  }),
  village: z.string().trim().min(1, 'Village is required'),
  district: z.string().trim().min(1, 'District is required'),
  state: z.string().trim().min(1, 'State is required'),
  affiliatedOrg: z.string().optional().refine(
    val => !val || /^[0-9a-fA-F]{24}$/.test(val),
    'Invalid AO Organization ID'
  ),
  mainLivelihood: z.string().trim().min(1, 'Main livelihood is required'),
  livelihoodExperience: positiveNumberSchema('Experience years must be at least 0'),
  otherLivelihoods: z.array(z.string().trim()).optional(),
  yearlyRevenue: positiveNumberSchema('Yearly revenue must be at least 0').optional(),
  qualification: z.string().trim().optional(),
  languages: z.array(z.string().trim()).min(1, 'At least one language must be specified'),
  hasMachineExp: z.boolean(),
  trainingsTaken: z.string().trim().optional(),
  machineExpYears: nullableNumberSchema.default(0),
  machinesWorkedWith: z.array(z.string().trim()).optional(),
  vleCategory: z.enum(['Mechanic', 'Electrician', 'Plumber', 'Other'], {
    errorMap: () => ({ message: 'VLE category must be Mechanic, Electrician, Plumber, or Other' })
  }),
  vleCategoryOther: z.string().trim().nullable().optional(),
  supportAssessment: z.array(
    z.enum([
      'open_to_innovations',
      'willing_to_travel',
      'open_to_investments',
      'has_smartphone',
      'village_groups',
      'literate_local_language',
      'identify_tech_gaps',
      'business_experience'
    ])
  ).optional()
}).refine(
  (data) => !data.hasMachineExp || data.trainingsTaken,
  { message: 'Training details are required when machine experience is true', path: ['trainingsTaken'] }
).refine(
  (data) => !data.hasMachineExp || (data.machinesWorkedWith && data.machinesWorkedWith.length > 0),
  { message: 'Machines worked with is required when machine experience is true', path: ['machinesWorkedWith'] }
);

// Field names match exactly what the frontend affiliatedOrgSchema sends to the API
const aoRegistrationSchema = z.object({
  orgName: z.string().trim().min(1, 'Organization name is required'),
  nodalOrg: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Nodal Organization ID'),
  orgType: z.enum(['fpc', 'shg', 'ngo', 'other'], {
    errorMap: () => ({ message: 'Organization type must be fpc, shg, ngo, or other' })
  }),
  orgTypeOther: z.string().trim().optional().or(z.literal('')),
  streamOfWork: z.array(z.enum(['agriculture', 'skill_building', 'livelihoods', 'textiles', 'arts_crafts', 'climate_change', 'other'])).min(1, 'At least one stream of work is required'),
  streamOfWorkOther: z.string().trim().optional().or(z.literal('')),
  pocName: z.string().trim().min(1, 'POC name is required'),
  village: z.string().trim().min(1, 'Village is required'),
  district: z.string().trim().min(1, 'District is required'),
  state: z.string().trim().min(1, 'State is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal(''))
});

// AO-assisted VLE registration: includes auth fields + same VLE profile fields as vleRegistrationSchema
const aoVleRegistrationSchema = z.object({
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
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long (max 50 characters)')
    .regex(/^[a-zA-Z\s]*$/, 'Name should only contain letters and spaces'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  age: z.number().int('Age must be an integer').min(10, 'Age must be at least 10').max(100, 'Age must be at most 100'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gender must be male, female, or other' })
  }),
  village: z.string().trim().min(1, 'Village is required'),
  district: z.string().trim().min(1, 'District is required'),
  state: z.string().trim().min(1, 'State is required'),
  affiliatedOrg: z.string().optional().refine(
    val => !val || /^[0-9a-fA-F]{24}$/.test(val),
    'Invalid AO Organization ID'
  ),
  mainLivelihood: z.string().trim().min(1, 'Main livelihood is required'),
  livelihoodExperience: z.number().min(0, 'Experience years must be at least 0'),
  otherLivelihoods: z.array(z.string().trim()).optional(),
  yearlyRevenue: z.number().min(0, 'Yearly revenue must be at least 0').optional(),
  qualification: z.string().trim().optional(),
  languages: z.array(z.string().trim()).min(1, 'At least one language must be specified'),
  hasMachineExp: z.boolean(),
  trainingsTaken: z.string().trim().optional(),
  machineExpYears: z.number().min(0, 'Machine experience years must be at least 0').default(0),
  machinesWorkedWith: z.array(z.string().trim()).optional(),
  vleCategory: z.enum(['Mechanic', 'Electrician', 'Plumber', 'Other'], {
    errorMap: () => ({ message: 'VLE category must be Mechanic, Electrician, Plumber, or Other' })
  }),
  vleCategoryOther: z.string().trim().nullable().optional(),
  supportAssessment: z.array(
    z.enum([
      'open_to_innovations',
      'willing_to_travel',
      'open_to_investments',
      'has_smartphone',
      'village_groups',
      'literate_local_language',
      'identify_tech_gaps',
      'business_experience'
    ])
  ).optional(),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric')
}).refine(
  (data) => data.email || data.phone,
  { message: 'Either email or phone must be provided' }
).refine(
  (data) => !(data.email && data.phone),
  { message: 'Provide either email or phone number, not both' }
).refine(
  (data) => !data.hasMachineExp || data.trainingsTaken,
  { message: 'Training details are required when machine experience is true', path: ['trainingsTaken'] }
).refine(
  (data) => !data.hasMachineExp || (data.machinesWorkedWith && data.machinesWorkedWith.length > 0),
  { message: 'Machines worked with is required when machine experience is true', path: ['machinesWorkedWith'] }
);

// Field names match exactly what the frontend innovatorSchema transform sends to the API
const innovatorRegistrationSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long (max 50 characters)')
    .regex(/^[a-zA-Z\s]*$/, 'Name should only contain letters and spaces'),
  enterpriseName: z.string().trim().optional(),
  startDate: z.coerce.date().nullable().optional(),
  links: z.string()
    .min(1, 'Link is required')
    .max(500, 'URL is too long (max 500 characters)')
    .url('Please enter a valid URL'),
  addressLine1: z.string().trim().min(5, 'Address is too short').max(200, 'Too long (max 200 characters)'),
  addressLine2: z.string().trim().optional(),
  district: z.string().trim().min(1, 'District is required'),
  state: z.string().trim().min(1, 'State is required'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(1000, 'Too long (max 1000 characters)')
});

// Field names match exactly what the frontend nodalOrgSchema sends to the API
const nodalOrgRegistrationSchema = z.object({
  orgName: z.string().trim().min(3, 'Organization name must be at least 3 characters').max(100, 'Organization name must not exceed 100 characters'),
  website: z.string().url('Invalid website URL'),
  orgType: z.enum(['non-profit', 'for-profit', 'government', 'hybrid'], {
    errorMap: () => ({ message: 'Organization type must be non-profit, for-profit, government, or hybrid' })
  }),
  hqState: z.string().trim().min(1, 'HQ state is required'),
  operationalStates: z.array(z.string().trim()).min(1, 'At least one operational state is required'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(1000, 'Description must not exceed 1000 characters'),
  hasRuralPrograms: z.enum(['yes', 'no', 'under_progress'], {
    errorMap: () => ({ message: 'hasRuralPrograms must be yes, no, or under_progress' })
  }),
  hasTechIntegration: z.enum(['yes', 'no', 'under_progress'], {
    errorMap: () => ({ message: 'hasTechIntegration must be yes, no, or under_progress' })
  }),
  channels: z.array(z.enum([
    'Own Organization Branches',
    'FPOs / FPCs',
    'Cooperatives',
    'Gram Panchayats',
    'Other formal village or block level set-ups'
  ], { errorMap: () => ({ message: 'Channel must be one of the allowed options' }) }))
    .min(1, { message: 'Select at least one channel' }),
  potentialAoCount: z.number()
    .int('Potential AO count must be an integer')
    .min(1, 'Potential AO count must be at least 1')
    .max(10000, 'Potential AO count must not exceed 10000')
    .optional()
});

// Field names match exactly what the frontend generalUserSchema sends to the API
const generalUserRegistrationSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long (max 50 characters)')
    .regex(/^[a-zA-Z\s]*$/, 'Name should only contain letters and spaces'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  age: z.number().int('Age must be an integer').min(10, 'Age must be at least 10').max(100, 'Age must be at most 100'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gender must be male, female, or other' })
  }),
  state: z.string().trim().min(1, 'State is required'),
  district: z.string().trim().min(1, 'District is required'),
  village: z.string().trim().min(3, 'Village must be at least 3 characters').max(50, 'Village must not exceed 50 characters')
});

module.exports = {
  aoInitiateVleRegistrationSchema,
  aoResendVleOtpSchema,
  vleRegistrationSchema,
  aoRegistrationSchema,
  aoVleRegistrationSchema,
  innovatorRegistrationSchema,
  nodalOrgRegistrationSchema,
  generalUserRegistrationSchema
};
