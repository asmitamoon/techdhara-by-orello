const { z } = require('zod');

const rejectInnovationSchema = z.object({
  rejectionReason: z.string().trim().optional()
});

const rejectProblemSchema = z.object({
  rejectionReason: z.string().trim().optional()
});

const rejectUserSchema = z.object({
  rejectionReason: z.string().trim().optional()
});

const updateUserSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').optional(),
  email: z.string().email('Invalid email address').toLowerCase().trim().optional(),
  phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  profilePicture: z.string().url('Invalid URL').optional()
});

const changeRoleSchema = z.object({
  newRole: z.enum(['VLE', 'INNOVATOR', 'CSO', 'FUNDER', 'AO'], {
    errorMap: () => ({ message: 'Invalid role. Cannot change to/from ADMIN role.' })
  })
});

const changeStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED', 'BANNED'], {
    errorMap: () => ({ message: 'Invalid status' })
  }),
  reason: z.string().trim().min(10, 'Reason must be at least 10 characters').optional()
});

module.exports = {
  rejectInnovationSchema,
  rejectProblemSchema,
  rejectUserSchema,
  updateUserSchema,
  changeRoleSchema,
  changeStatusSchema
};
