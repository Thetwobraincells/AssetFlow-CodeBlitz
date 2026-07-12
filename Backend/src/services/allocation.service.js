const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const prisma = new PrismaClient();

class AllocationService {
  static async allocateAsset(tenantId, data, allocatedBy) {
    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findFirst({
        where: { id: data.asset_id, organization_id: tenantId }
      });

      if (!asset) throw new ApiError(404, 'NOT_FOUND', 'Asset not found');
      if (asset.status !== 'available') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Asset is not available for allocation');
      }

      const user = await tx.user.findFirst({
        where: { id: data.user_id, organization_id: tenantId, status: 'active' }
      });

      if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found or inactive');

      const allocation = await tx.allocation.create({
        data: {
          asset_id: data.asset_id,
          user_id: data.user_id,
          allocated_by: allocatedBy
        }
      });

      await tx.asset.update({
        where: { id: data.asset_id },
        data: { status: 'allocated' }
      });

      return allocation;
    });
  }

  static async returnAsset(tenantId, allocationId, data) {
    return prisma.$transaction(async (tx) => {
      const allocation = await tx.allocation.findFirst({
        where: { id: allocationId, return_date: null },
        include: { asset: true }
      });

      if (!allocation || allocation.asset.organization_id !== tenantId) {
        throw new ApiError(404, 'NOT_FOUND', 'Active allocation not found');
      }

      const updatedAllocation = await tx.allocation.update({
        where: { id: allocationId },
        data: {
          return_date: new Date(),
          condition_notes: data.condition_notes
        }
      });

      await tx.asset.update({
        where: { id: allocation.asset_id },
        data: { status: 'available' }
      });

      return updatedAllocation;
    });
  }

  static async transferAsset(tenantId, data, transferredBy) {
    return prisma.$transaction(async (tx) => {
      // Find active allocation for from_user
      const currentAllocation = await tx.allocation.findFirst({
        where: {
          asset_id: data.asset_id,
          user_id: data.from_user_id,
          return_date: null
        },
        include: { asset: true }
      });

      if (!currentAllocation || currentAllocation.asset.organization_id !== tenantId) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Asset is not currently allocated to the source user');
      }

      const toUser = await tx.user.findFirst({
        where: { id: data.to_user_id, organization_id: tenantId, status: 'active' }
      });

      if (!toUser) throw new ApiError(404, 'NOT_FOUND', 'Target user not found or inactive');

      // Return from current user
      await tx.allocation.update({
        where: { id: currentAllocation.id },
        data: { return_date: new Date(), condition_notes: `Transferred to ${toUser.name}. Reason: ${data.reason || 'N/A'}` }
      });

      // Allocate to new user
      const newAllocation = await tx.allocation.create({
        data: {
          asset_id: data.asset_id,
          user_id: data.to_user_id,
          allocated_by: transferredBy
        }
      });

      // Asset remains 'allocated'
      return newAllocation;
    });
  }
}

module.exports = AllocationService;
