import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().refine((val) => {
    const isEmail = z.string().email().safeParse(val).success;
    const isMobile = /^[6-9]\d{9}$/.test(val);
    return isEmail || isMobile;
  }, {
    message: "Please enter a valid email address or 10-digit mobile number"
  }),
  password: z.string().min(1, "Password is required")
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().refine((val) => {
    const isEmail = z.string().email().safeParse(val).success;
    const isMobile = /^[6-9]\d{9}$/.test(val);
    return isEmail || isMobile;
  }, {
    message: "Please enter a valid email address or 10-digit mobile number"
  })
});

export const resetPasswordSchema = z.object({
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
