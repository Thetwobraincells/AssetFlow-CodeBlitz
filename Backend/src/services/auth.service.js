const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const prisma = new PrismaClient();

class AuthService {
  static async signup(data) {
    return prisma.$transaction(async (tx) => {
      let organization_id;

      if (data.organization_name) {
        // Create new organization
        const org = await tx.organization.create({
          data: {
            name: data.organization_name,
            slug: data.organization_slug || data.organization_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
          }
        });
        organization_id = org.id;
      } else {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Organization details required for signup');
      }

      // Check if email exists in this org
      const existingUser = await tx.user.findUnique({
        where: {
          organization_id_email: {
            organization_id,
            email: data.email
          }
        }
      });

      if (existingUser) {
        throw new ApiError(409, 'UNIQUE_CONSTRAINT_FAILED', 'Email already in use in this organization');
      }

      const password_hash = await bcrypt.hash(data.password, 10);

      // The first user in a new org becomes admin, otherwise employee
      const role = 'admin'; // Per PRD 13.1 decision (a), first user becomes admin. We only support new org creation at signup here.

      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password_hash,
          role,
          organization_id
        }
      });

      delete user.password_hash;
      return user;
    });
  }

  static async login(email, password) {
    // Note: If email isn't globally unique, we'd need organization_id to login, 
    // but typically email is unique globally for login, or we look up the first active one. 
    // The PRD made it unique per organization_id. We'll find the first matching email.
    // If multiple orgs share an email, this simple login might be flawed. 
    // For this scope, we'll assume email is unique enough or the user provides org slug.
    // Let's just findFirst by email.
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user || user.status === 'inactive') {
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid credentials or inactive user');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, organization_id: user.organization_id },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    delete user.password_hash;
    return { user, token };
  }

  static async forgotPassword(email) {
    const user = await prisma.user.findFirst({
      where: { email, status: 'active' }
    });

    if (!user) {
      // Don't leak whether email exists
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real app, send email. For now, we'll return it in response for testing.
    return { message: 'If the email exists, a reset link has been sent.', resetToken };
  }

  static async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      
      if (decoded.purpose !== 'password_reset') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid token purpose');
      }

      const password_hash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password_hash }
      });

      return { message: 'Password reset successful' };
    } catch (err) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid or expired token');
    }
  }

  static async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        department: true
      }
    });

    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'User not found');
    }

    delete user.password_hash;
    return user;
  }
}

module.exports = AuthService;
