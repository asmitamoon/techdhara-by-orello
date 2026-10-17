const { z } = require('zod');
const { INNOVATION_CATEGORIES, INNOVATION_SUBCATEGORIES } = require('../utils/constants/innovationConstants');

const categoryEnum = z.enum(INNOVATION_CATEGORIES);

const subCategoryEnum = z.enum(INNOVATION_SUBCATEGORIES);

const roleEnum = z.enum(['VLE', 'INNOVATOR', 'NO', 'AO', 'GENERAL_USER']);

const paginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .pipe(z.number().min(1))
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default('20'),
  sortBy: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc')
});

const statusFilterSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED']).optional()
});

module.exports = {
  categoryEnum,
  subCategoryEnum,
  roleEnum,
  paginationSchema,
  statusFilterSchema
};
