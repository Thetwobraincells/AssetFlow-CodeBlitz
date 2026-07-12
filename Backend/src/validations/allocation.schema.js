const { z } = require('zod');

const allocateAssetSchema = z.object({
  body: z.object({
    asset_id: z.string().uuid("Invalid asset ID"),
    employee_id: z.string().uuid("Invalid employee ID")
  })
});

const returnAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid allocation ID")
  }),
  body: z.object({
    return_condition_notes: z.string().optional()
  })
});

const transferAssetSchema = z.object({
  body: z.object({
    asset_id: z.string().uuid("Invalid asset ID"),
    from_user_id: z.string().uuid("Invalid from user ID"),
    to_user_id: z.string().uuid("Invalid to user ID"),
    reason: z.string().optional()
  })
});

module.exports = {
  allocateAssetSchema,
  returnAssetSchema,
  transferAssetSchema
};
