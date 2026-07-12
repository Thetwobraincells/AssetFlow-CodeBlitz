const { z } = require('zod');

const createBookingSchema = z.object({
  body: z.object({
    asset_id: z.string().uuid("Invalid asset ID"),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    purpose: z.string().optional()
  })
}).refine(data => new Date(data.body.start_time) < new Date(data.body.end_time), {
  message: "End time must be after start time",
  path: ["body", "end_time"]
});

module.exports = {
  createBookingSchema
};
