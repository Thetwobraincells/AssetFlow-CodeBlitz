const { z } = require('zod');

const createAssetSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(255),
    category_id: z.string().uuid("Invalid category ID"),
    purchase_cost: z.number().positive().optional(),
    purchase_date: z.string().datetime().optional(),
    department_id: z.string().uuid().optional().nullable(),
    custom_attributes: z.record(z.any()).optional()
  })
});

const updateAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid asset ID")
  }),
  body: z.object({
    name: z.string().min(2).max(255).optional(),
    status: z.enum(['available', 'allocated', 'in_maintenance', 'retired', 'lost']).optional(),
    department_id: z.string().uuid().optional().nullable(),
    custom_attributes: z.record(z.any()).optional()
  })
});

module.exports = {
  createAssetSchema,
  updateAssetSchema
};
