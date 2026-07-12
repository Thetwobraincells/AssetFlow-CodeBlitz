const { z } = require('zod');

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(120),
    email: z.string().email("Invalid email format").max(160),
    password: z.string().min(6, "Password must be at least 6 characters"),
    organization_name: z.string().min(2, "Organization name must be at least 2 characters").optional(), // For new org creation
    organization_slug: z.string().optional() // For new org creation
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  })
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
});

module.exports = {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
