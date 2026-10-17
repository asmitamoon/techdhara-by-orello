const { z } = require('zod');
const { categoryEnum, subCategoryEnum } = require('./commonValidation');

const innovationStageEnum = z.enum(['IDEA', 'PROTOTYPE', 'PILOT', 'MARKET']);

const innovationSortByEnum = z.enum(['createdAt', 'title']);
const problemSortByEnum = z.enum(['createdAt', 'upvotes', 'title']);

const getPublishedInnovationsSchema = z.object({
  category: categoryEnum.optional(),
  subCategory: subCategoryEnum.optional(),
  stage: innovationStageEnum.optional(),
  operation: z.string().trim().min(1).optional(),
  state: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).max(200).optional(),
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
  sortBy: innovationSortByEnum.default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc')
});

const getPublishedProblemsSchema = z.object({
  category: categoryEnum.optional(),
  subCategory: subCategoryEnum.optional(),
  search: z.string().trim().min(1).max(200).optional(),
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
  sortBy: problemSortByEnum.default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  getPublishedInnovationsSchema,
  getPublishedProblemsSchema
};
