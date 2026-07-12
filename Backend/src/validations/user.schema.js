const { z } = require('zod');

const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID")
  }),
  body: z.object({
    role: z.enum(['admin', 'asset_manager', 'department_head', 'employee'])
  })
});

const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID")
  }),
  body: z.object({
    status: z.enum(['active', 'inactive'])
  })
});

module.exports = {
  updateRoleSchema,
  updateStatusSchema
};
