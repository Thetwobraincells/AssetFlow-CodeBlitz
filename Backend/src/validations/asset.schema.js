const { z } = require('zod');

const createAssetSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(160),
    category_id: z.string().uuid("Invalid category ID"),
    acquisition_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for acquisition_date"
    }),
    acquisition_cost: z.number().positive("acquisition_cost must be a positive number"),
    condition: z.enum(['excellent', 'good', 'fair', 'poor']),
    location: z.string().min(1).max(160),
    serial_number: z.string().max(120).optional().nullable(),
    qr_code: z.string().max(160).optional().nullable(),
    department_id: z.string().uuid().optional().nullable(),
    is_bookable: z.boolean().optional(),
    photo_url: z.string().optional().nullable()
  })
});

const updateAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid asset ID")
  }),
  body: z.object({
    name: z.string().min(2).max(160).optional(),
    status: z.enum(['available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed']).optional(),
    condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
    location: z.string().min(1).max(160).optional(),
    department_id: z.string().uuid().optional().nullable(),
    is_bookable: z.boolean().optional(),
    photo_url: z.string().optional().nullable(),
    serial_number: z.string().max(120).optional().nullable(),
    qr_code: z.string().max(160).optional().nullable()
  })
});

module.exports = {
  createAssetSchema,
  updateAssetSchema
};
