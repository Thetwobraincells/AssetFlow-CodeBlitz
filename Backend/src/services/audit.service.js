const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const NotificationService = require('./notification.service');
const prisma = new PrismaClient();

class AuditService {
  /**
   * Create a new audit cycle.
   * Snapshots all active assets (optionally filtered by department) into audit_items.
   */
  static async createCycle(tenantId, userId, data) {
    return prisma.$transaction(async (tx) => {
      const assetWhere = { organization_id: tenantId, status: { not: 'retired' } };
      if (data.scope_department_id) {
        assetWhere.department_id = data.scope_department_id;
      }

      const assets = await tx.asset.findMany({ where: assetWhere });

      if (assets.length === 0) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'No assets found to audit');
      }

      const cycle = await tx.auditCycle.create({
        data: {
          name: data.name,
          organization_id: tenantId,
          created_by: userId,
          status: 'draft',
          scope_department_id: data.scope_department_id || null,
          scope_location: data.scope_location || null,
          date_range_start: new Date(data.date_range_start),
          date_range_end: new Date(data.date_range_end)
        }
      });

      // Snapshot each asset as an audit item
      const auditItemsData = assets.map((asset) => ({
        audit_cycle_id: cycle.id,
        asset_id: asset.id,
        expected_location: asset.location || 'Unknown',
        verification_status: 'pending'
      }));

      await tx.auditItem.createMany({ data: auditItemsData });

      return { ...cycle, items_created: assets.length };
    });
  }

  /**
   * Get all audit cycles for the tenant.
   */
  static async getCycles(tenantId) {
    return prisma.auditCycle.findMany({
      where: { organization_id: tenantId },
      orderBy: { created_at: 'desc' }
    });
  }

  /**
   * Get a single audit cycle with its items.
   */
  static async getCycleById(tenantId, cycleId) {
    const cycle = await prisma.auditCycle.findFirst({
      where: { id: cycleId, organization_id: tenantId },
      include: {
        items: {
          include: {
            asset: { select: { id: true, name: true, asset_tag: true, status: true } }
          }
        }
      }
    });

    if (!cycle) throw new ApiError(404, 'NOT_FOUND', 'Audit cycle not found');
    return cycle;
  }

  /**
   * Verify an individual audit item (mark as verified, missing, or damaged).
   */
  static async verifyItem(tenantId, userId, cycleId, itemId, data) {
    return prisma.$transaction(async (tx) => {
      const cycle = await tx.auditCycle.findFirst({
        where: { id: cycleId, organization_id: tenantId, status: 'active' }
      });

      if (!cycle) throw new ApiError(400, 'VALIDATION_ERROR', 'Audit cycle not found or already closed');

      const item = await tx.auditItem.findFirst({
        where: { id: itemId, audit_cycle_id: cycleId }
      });

      if (!item) throw new ApiError(404, 'NOT_FOUND', 'Audit item not found');

      if (item.verification_status !== 'pending') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'This item has already been verified');
      }

      const updatedItem = await tx.auditItem.update({
        where: { id: itemId },
        data: {
          verification_status: data.status,
          verified_by: userId,
          verified_at: new Date(),
          notes: data.notes || null
        }
      });

      return updatedItem;
    });
  }

  /**
   * Close an audit cycle.
   * This is the complex transaction: all items marked 'missing' cause their
   * assets to be flipped to 'lost'. A notification is sent for each.
   */
  static async closeCycle(tenantId, userId, cycleId) {
    return prisma.$transaction(async (tx) => {
      const cycle = await tx.auditCycle.findFirst({
        where: { id: cycleId, organization_id: tenantId, status: 'active' },
        include: { items: true }
      });

      if (!cycle) throw new ApiError(400, 'VALIDATION_ERROR', 'Audit cycle not found or already closed');

      // Check if there are any unverified items
      const pendingItems = cycle.items.filter(i => i.verification_status === 'pending');
      if (pendingItems.length > 0) {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          `Cannot close cycle: ${pendingItems.length} items still pending verification`
        );
      }

      // Flip all 'missing' assets to 'lost'
      const missingItems = cycle.items.filter(i => i.verification_status === 'missing');
      for (const item of missingItems) {
        await tx.asset.update({
          where: { id: item.asset_id },
          data: { status: 'lost' }
        });

        // Notify admins about each lost asset
        const admins = await tx.user.findMany({
          where: { organization_id: tenantId, role: 'admin', status: 'active' }
        });

        for (const admin of admins) {
          await NotificationService.createInTransaction(tx, {
            user_id: admin.id,
            organization_id: tenantId,
            type: 'audit_discrepancy',
            message: `Asset (ID: ${item.asset_id}) was marked as missing during audit "${cycle.name}" and has been set to 'lost'.`,
            related_entity_type: 'audit_cycle',
            related_entity_id: cycleId
          });
        }
      }

      // Close the cycle
      const closedCycle = await tx.auditCycle.update({
        where: { id: cycleId },
        data: {
          status: 'closed',
          closed_at: new Date()
        }
      });

      return {
        ...closedCycle,
        assets_marked_lost: missingItems.length
      };
    });
  }
}

module.exports = AuditService;
