const { z } = require('zod');

const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    code: z.string().min(2).max(20),
    head_user_id: z.string().uuid().optional().nullable(),
    parent_department_id: z.string().uuid().optional().nullable()
  })
});

const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid department ID")
  }),
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    code: z.string().min(2).max(20).optional(),
    head_user_id: z.string().uuid().optional().nullable(),
    parent_department_id: z.string().uuid().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional()
  })
});

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    custom_fields: z.record(z.any()).optional()
  })
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category ID")
  }),
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    custom_fields: z.record(z.any()).optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
  createCategorySchema,
  updateCategorySchema
};
