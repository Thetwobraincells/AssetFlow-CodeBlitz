const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const prisma = new PrismaClient();

/**
 * NotificationService - Utility service for creating in-app notifications.
 * Designed to be called within Prisma $transaction blocks so notifications
 * are atomically committed alongside the business operation.
 *
 * NotificationType enum values:
 *   asset_assigned, maintenance_approved, maintenance_rejected,
 *   booking_confirmed, booking_cancelled, booking_reminder,
 *   transfer_approved, overdue_return, audit_discrepancy
 */
class NotificationService {
  /**
   * Create a notification within a transaction context.
   * @param {object} tx - Prisma transaction client
   * @param {object} params
   * @param {string} params.user_id - Recipient user ID
   * @param {string} params.organization_id - Tenant ID
   * @param {string} params.type - NotificationType enum value
   * @param {string} params.message - Notification body
   * @param {string} [params.related_entity_type] - Optional entity type (e.g. 'asset', 'maintenance_request')
   * @param {string} [params.related_entity_id] - Optional entity UUID
   */
  static async createInTransaction(tx, { user_id, organization_id, type, message, related_entity_type, related_entity_id }) {
    return tx.notification.create({
      data: {
        user_id,
        organization_id,
        type,
        message,
        related_entity_type: related_entity_type || null,
        related_entity_id: related_entity_id || null,
        is_read: false
      }
    });
  }

  /**
   * Create a notification outside a transaction (standalone).
   */
  static async create({ user_id, organization_id, type, message, related_entity_type, related_entity_id }) {
    return prisma.notification.create({
      data: {
        user_id,
        organization_id,
        type,
        message,
        related_entity_type: related_entity_type || null,
        related_entity_id: related_entity_id || null,
        is_read: false
      }
    });
  }

  /**
   * Get notifications for a user within their tenant.
   */
  static async getUserNotifications(tenantId, userId, { unreadOnly = false } = {}) {
    const where = {
      user_id: userId,
      organization_id: tenantId
    };
    if (unreadOnly) {
      where.is_read = false;
    }

    return prisma.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 50
    });
  }

  /**
   * Mark a single notification as read.
   */
  static async markAsRead(tenantId, userId, notificationId) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, user_id: userId, organization_id: tenantId }
    });

    if (!notification) throw new ApiError(404, 'NOT_FOUND', 'Notification not found');

    return prisma.notification.update({
      where: { id: notificationId },
      data: { is_read: true }
    });
  }

  /**
   * Mark all notifications as read for a user.
   */
  static async markAllAsRead(tenantId, userId) {
    return prisma.notification.updateMany({
      where: { user_id: userId, organization_id: tenantId, is_read: false },
      data: { is_read: true }
    });
  }
}

module.exports = NotificationService;
