const { z } = require('zod');

const createMaintenanceSchema = z.object({
  body: z.object({
    asset_id: z.string().uuid("Invalid asset ID"),
    issue_description: z.string().min(3),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    photo_url: z.string().optional().nullable()
  })
});

const updateMaintenanceStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid maintenance request ID")
  }),
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'technician_assigned', 'in_progress', 'resolved']),
    technician_name: z.string().max(120).optional(),
    resolution_notes: z.string().optional()
  })
});

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceStatusSchema
};
