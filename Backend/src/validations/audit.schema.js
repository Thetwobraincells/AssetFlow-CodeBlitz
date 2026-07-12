const { z } = require('zod');

const createAuditCycleSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(160),
    scope_department_id: z.string().uuid().optional().nullable(),
    scope_location: z.string().max(160).optional().nullable(),
    date_range_start: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for date_range_start"
    }),
    date_range_end: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for date_range_end"
    })
  })
});

const verifyAuditItemSchema = z.object({
  params: z.object({
    cycleId: z.string().uuid("Invalid cycle ID"),
    itemId: z.string().uuid("Invalid item ID")
  }),
  body: z.object({
    status: z.enum(['verified', 'missing', 'damaged']),
    notes: z.string().optional()
  })
});

module.exports = {
  createAuditCycleSchema,
  verifyAuditItemSchema
};
