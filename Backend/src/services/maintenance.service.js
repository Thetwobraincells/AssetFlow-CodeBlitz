const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const NotificationService = require('./notification.service');
const prisma = new PrismaClient();

/**
 * Valid Kanban state transitions for maintenance requests.
 * Each key is a current status; values are the allowed next statuses.
 *
 * MaintenanceStatus enum: pending, approved, rejected, technician_assigned, in_progress, resolved
 */
const VALID_TRANSITIONS = {
  pending: ['approved', 'rejected'],
  approved: ['technician_assigned', 'rejected'],
  technician_assigned: ['in_progress'],
  in_progress: ['resolved'],
  resolved: [],  // terminal state
  rejected: []   // terminal state
};

class MaintenanceService {
  /**
   * Raise a new maintenance request.
   * Atomically sets the asset to 'under_maintenance' and notifies the admin.
   */
  static async createRequest(tenantId, userId, data) {
    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findFirst({
        where: { id: data.asset_id, organization_id: tenantId }
      });

      if (!asset) throw new ApiError(404, 'NOT_FOUND', 'Asset not found');

      if (asset.status === 'retired' || asset.status === 'lost') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Cannot raise maintenance for a retired or lost asset');
      }

      const request = await tx.maintenanceRequest.create({
        data: {
          asset_id: data.asset_id,
          raised_by: userId,
          issue_description: data.issue_description,
          priority: data.priority || 'medium',
          photo_url: data.photo_url || null,
          status: 'pending',
          organization_id: tenantId
        }
      });

      // Set asset to under_maintenance
      await tx.asset.update({
        where: { id: data.asset_id },
        data: { status: 'under_maintenance' }
      });

      // Notify admins — find all admins in the org
      const admins = await tx.user.findMany({
        where: { organization_id: tenantId, role: 'admin', status: 'active' }
      });

      for (const admin of admins) {
        await NotificationService.createInTransaction(tx, {
          user_id: admin.id,
          organization_id: tenantId,
          type: 'maintenance_approved',
          message: `New maintenance request raised for asset ${asset.name || asset.asset_tag}: "${data.issue_description}".`,
          related_entity_type: 'maintenance_request',
          related_entity_id: request.id
        });
      }

      return request;
    });
  }

  /**
   * Update a maintenance request status (Kanban transition).
   * Enforces the state machine and updates asset status on resolve.
   */
  static async updateStatus(tenantId, userId, requestId, data) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findFirst({
        where: { id: requestId, organization_id: tenantId },
        include: { asset: true }
      });

      if (!request) throw new ApiError(404, 'NOT_FOUND', 'Maintenance request not found');

      // Validate state transition
      const allowed = VALID_TRANSITIONS[request.status];
      if (!allowed || !allowed.includes(data.status)) {
        throw new ApiError(
          400,
          'INVALID_STATE_TRANSITION',
          `Cannot transition from '${request.status}' to '${data.status}'. Allowed: [${(allowed || []).join(', ')}]`
        );
      }

      const updateData = { status: data.status };

      // Set approved_by when approving
      if (data.status === 'approved') {
        updateData.approved_by = userId;
      }

      if (data.technician_name) {
        updateData.technician_name = data.technician_name;
      }
      if (data.resolution_notes) {
        updateData.resolution_notes = data.resolution_notes;
      }
      if (data.status === 'resolved') {
        updateData.resolved_at = new Date();
      }

      const updatedRequest = await tx.maintenanceRequest.update({
        where: { id: requestId },
        data: updateData
      });

      // When resolved, set asset back to available
      if (data.status === 'resolved') {
        await tx.asset.update({
          where: { id: request.asset_id },
          data: { status: 'available' }
        });
      }

      // Notify the user who raised it
      const notificationType = data.status === 'rejected' ? 'maintenance_rejected' : 'maintenance_approved';
      await NotificationService.createInTransaction(tx, {
        user_id: request.raised_by,
        organization_id: tenantId,
        type: notificationType,
        message: `Your maintenance request for asset ${request.asset.name || request.asset.asset_tag} has been moved to '${data.status}'.`,
        related_entity_type: 'maintenance_request',
        related_entity_id: requestId
      });

      return updatedRequest;
    });
  }

  /**
   * Get all maintenance requests for the tenant with optional filters.
   */
  static async getRequests(tenantId, filters = {}) {
    const where = { organization_id: tenantId };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.asset_id) where.asset_id = filters.asset_id;

    return prisma.maintenanceRequest.findMany({
      where,
      include: {
        asset: { select: { id: true, name: true, asset_tag: true } },
      },
      orderBy: { created_at: 'desc' }
    });
  }

  /**
   * Get a single maintenance request by ID.
   */
  static async getRequestById(tenantId, requestId) {
    const request = await prisma.maintenanceRequest.findFirst({
      where: { id: requestId, organization_id: tenantId },
      include: {
        asset: true,
      }
    });
    if (!request) throw new ApiError(404, 'NOT_FOUND', 'Maintenance request not found');
    return request;
  }
}

module.exports = MaintenanceService;
