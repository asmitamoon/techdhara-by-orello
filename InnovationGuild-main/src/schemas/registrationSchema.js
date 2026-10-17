import { z } from 'zod';
import { mobileSchema, ageSchema, imageSchema, nameSchema, numericStringSchema, optionalNumericSchema } from './common';
import { NO_ORG_TYPES, YES_NO_PROGRESS, NO_CHANNELS } from '../utils/constants/nodalOrgConstants';
import { VLE_CATEGORIES, VLE_CATEGORY_OTHER } from '../utils/constants/vleConstants';

export const authSchema = z.object({
  identifier: z.string().refine((val) => {
    const isEmail = z.string().email().safeParse(val).success;
    const isMobile = /^[6-9]\d{9}$/.test(val);
    return isEmail || isMobile;
  }, {
    message: "Please enter a valid email address or 10-digit mobile number"
  }),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password is too long (max 50 characters)")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const generalUserSchema = z.object({
  fullName: nameSchema,
  age: ageSchema,
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: "Gender is required" })
  }),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  village: z.string().min(3, "Village/City name too short").max(50, "Too long (max 50 characters)"),
  mobile: mobileSchema,
  profilePic: imageSchema,
});

export const vleBaseSchema = z.object({
  fullName: nameSchema,
  age: ageSchema,
  gender: z.string().min(1, "Gender is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  village: z.string().min(3, "Village/City name too short").max(50, "Too long (max 50 characters)"),
  mobile: mobileSchema,
  profilePic: imageSchema,
  affiliatedOrg: z.string().max(100, "Too long (max 100 characters)").optional(),
  isNotAffiliated: z.boolean(),
  mainLivelihood: z.string().min(3, "Please enter at least 3 characters").max(50, "Too long (max 50 characters)"),
  livelihoodExperience: numericStringSchema("Years of experience is required")
    .refine((val) => val > 0 && val <= 100, { message: "Experience must be between 1-100 years" }),
  otherLivelihoods: z.array(z.string()).optional(),
  yearlyRevenue: numericStringSchema("Yearly revenue is required")
    .refine((val) => val > 0, { message: "Revenue must be greater than 0" }),
  qualification: z.string().min(3, "Please enter at least 3 characters").max(50, "Too long (max 50 characters)"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  hasMachineExp: z.enum(['yes', 'no']).nullable().refine(val => val !== null, {
    message: "Please select an option",
  }),
  trainingsTaken: z.string().max(200, "Too long (max 200 characters)").optional(),
  machineExpYears: optionalNumericSchema.optional(),
  machinesWorkedWith: z.array(z.string()).optional(),
  vleCategory: z.enum(VLE_CATEGORIES, { errorMap: () => ({ message: "VLE Category is required" }) }),
  vleCategoryOther: z.string()
    .regex(/^[a-zA-Z0-9\s-]+$/, "Only letters, numbers, spaces, and hyphens are allowed")
    .max(50, "Too long (max 50 characters)")
    .optional()
    .or(z.literal('')),
  supportAssessment: z.array(z.string()).optional(),
});

// Reusable helper — applies all 5 VLE cross-field refines to any schema that
// extends vleBaseSchema (used by both vleSchema and adminVleSchema).
export const applyVleRefines = (schema) => schema
  .refine((data) => {
    if (data.hasMachineExp === 'yes') return !!data.trainingsTaken;
    return true;
  }, { message: "Please mention the trainings taken", path: ["trainingsTaken"] })
  .refine((data) => {
    if (data.hasMachineExp === 'yes') {
      const years = data.machineExpYears;
      if (years === null || years === undefined) return false;
      return years > 0 && years <= 100;
    }
    return true;
  }, { message: "Experience must be between 1-100 years", path: ["machineExpYears"] })
  .refine((data) => {
    if (data.hasMachineExp === 'yes') return data.machinesWorkedWith?.length > 0;
    return true;
  }, { message: "Please add at least one machine", path: ["machinesWorkedWith"] })
  .refine((data) => {
    if (data.vleCategory === VLE_CATEGORY_OTHER) return !!data.vleCategoryOther && data.vleCategoryOther.trim().length > 0;
    return true;
  }, { message: "Please specify the category", path: ["vleCategoryOther"] })
  .refine((data) => {
    if (!data.isNotAffiliated) return !!data.affiliatedOrg && data.affiliatedOrg.length >= 1;
    return true;
  }, { message: "Please select an affiliated organization", path: ["affiliatedOrg"] });

// Shared transform for both vleSchema and adminVleSchema
export const vleTransformFn = (data) => {
  const { isNotAffiliated, hasMachineExp, ...rest } = data;
  const result = {
    ...rest,
    vleCategoryOther: data.vleCategory === VLE_CATEGORY_OTHER ? data.vleCategoryOther : null,
    hasMachineExp: hasMachineExp === 'yes',
  };
  if (isNotAffiliated) {
    delete result.affiliatedOrg;
  }
  return result;
};

export const vleSchema = applyVleRefines(vleBaseSchema).transform(vleTransformFn);

export const innovatorSchema = z.object({
  profilePic: imageSchema,
  fullName: nameSchema,
  enterpriseName: z.string().max(100, "Too long (max 100 characters)").optional(),
  isNotRegistered: z.boolean(),
  startDate: z.date().refine(d => d <= new Date(), { message: "Start date cannot be in the future" }).nullable().optional(),
  links: z.string().min(1, "Link is required").max(500, "URL is too long (max 500 characters)").url("Please enter a valid URL (e.g. https://example.com)"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  // village removed - Innovator form uses addressLine1/addressLine2 for full business address instead
  addressLine1: z.string().min(5, "Address is too short").max(200, "Too long (max 200 characters)"),
  addressLine2: z.string().max(200, "Too long (max 200 characters)").optional(),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Too long"),
}).refine((data) => {
  if (!data.isNotRegistered) {
    return !!data.enterpriseName && data.enterpriseName.length >= 3;
  }
  return true;
}, {
  message: "Enterprise name is required when registered",
  path: ["enterpriseName"],
}).refine((data) => {
  if (!data.isNotRegistered && data.enterpriseName && data.enterpriseName.length >= 3) {
    return !!data.startDate;
  }
  return true;
}, {
  message: "Please select when your enterprise was started",
  path: ["startDate"],
}).transform((data) => {
  const { isNotRegistered, ...rest } = data;
  return rest;
});

const affiliatedOrgBaseObject = z.object({
  logo: imageSchema,
  orgName: z.string().min(3, "Organization name too short").max(100, "Name is too long (max 100 characters)"),
  orgType: z.string().min(1, "Organization type is required"),
  orgTypeOther: z.string()
    .regex(/^[a-zA-Z0-9\s-]+$/, "Only letters, numbers, spaces, and hyphens are allowed")
    .max(50, "Too long (max 50 characters)")
    .optional()
    .or(z.literal('')),
  streamOfWork: z.array(z.string()).min(1, "Select at least one stream"),
  streamOfWorkOther: z.string()
    .regex(/^[a-zA-Z0-9\s-]+$/, "Only letters, numbers, spaces, and hyphens are allowed")
    .max(50, "Too long (max 50 characters)")
    .optional()
    .or(z.literal('')),
  pocName: nameSchema,
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  village: z.string().min(3, "Village/City name too short").max(50, "Too long (max 50 characters)"),
  website: z.string().max(500, "URL is too long").url("Invalid URL").optional().or(z.literal('')),
});

const applyAffiliatedOrgRefines = (schema) => schema
  .refine((data) => {
    if (data.orgType === 'other') return !!data.orgTypeOther;
    return true;
  }, {
    message: "Please specify the organization type",
    path: ["orgTypeOther"],
  })
  .refine((data) => {
    if (data.streamOfWork.includes('other')) return !!data.streamOfWorkOther;
    return true;
  }, {
    message: "Please specify the stream of work",
    path: ["streamOfWorkOther"],
  });

// Self-registration: AO picks their nodal org from a list
export const affiliatedOrgSchema = applyAffiliatedOrgRefines(
  affiliatedOrgBaseObject.extend({
    nodalOrg: z.string().min(1, "Nodal organization is required"),
  })
);

// NO-creates-AO: nodal org is derived server-side from req.user._id
export const affiliatedOrgByNOSchema = applyAffiliatedOrgRefines(affiliatedOrgBaseObject);

export const nodalOrgSchema = z.object({
  logo: imageSchema,
  orgName: z.string().min(3, "Organization name too short").max(100, "Name is too long (max 100 characters)"),
  website: z.string().max(500, "URL is too long").url("Please enter a valid URL"),
  orgType: z.enum(NO_ORG_TYPES, { errorMap: () => ({ message: "Organization type is required" }) }),
  hqState: z.string().min(1, "HQ state is required"),
  // village removed - Nodal Organizations operate at state/national level, not village-specific
  operationalStates: z.array(z.string()).min(1, "Select at least one state"),
  description: z.string().min(20, "Description too short").max(1000, "Too long"),
  hasRuralPrograms: z.enum(YES_NO_PROGRESS, { errorMap: () => ({ message: "Please select an option" }) }),
  hasTechIntegration: z.enum(YES_NO_PROGRESS, { errorMap: () => ({ message: "Please select an option" }) }),
  channels: z.array(z.enum(NO_CHANNELS)).min(1, { message: "Select at least one channel" }),
  potentialAoCount: optionalNumericSchema
    .refine((val) => {
      if (val === null) return true;
      return val > 0 && val <= 10000;
    }, { message: "Count must be between 1-10000" })
    .optional(),
});

export const adminSchema = z.object({
  fullName: nameSchema,
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email is too long (max 100 characters)"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password is too long (max 50 characters)")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const registrationAuthFields = z.object({
  registrationType: z.enum(['email', 'mobile'], {
    errorMap: () => ({ message: "Please select a registration type" })
  }),
  identifier: z.string().min(1, "This field is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password is too long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
});

export const vleRegistrationByAOSchema = registrationAuthFields.and(vleSchema)
  .superRefine((data, ctx) => {
    const validEmail = z.string().email().safeParse(data.identifier).success;
    const validMobile = /^[6-9]\d{9}$/.test(data.identifier);
    if (data.registrationType === 'email' && !validEmail) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid email or 10-digit mobile number", path: ["identifier"] });
    } else if (data.registrationType === 'mobile' && !validMobile) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid email or 10-digit mobile number", path: ["identifier"] });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: "custom", message: "Passwords do not match", path: ["confirmPassword"] });
    }
  });

export const affiliatedOrgRegistrationByNOSchema = registrationAuthFields.and(affiliatedOrgByNOSchema)
  .superRefine((data, ctx) => {
    const validEmail = z.string().email().safeParse(data.identifier).success;
    const validMobile = /^[6-9]\d{9}$/.test(data.identifier);
    if (data.registrationType === 'email' && !validEmail) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid email or 10-digit mobile number", path: ["identifier"] });
    } else if (data.registrationType === 'mobile' && !validMobile) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid email or 10-digit mobile number", path: ["identifier"] });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: "custom", message: "Passwords do not match", path: ["confirmPassword"] });
    }
  });