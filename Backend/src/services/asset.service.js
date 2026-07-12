const { PrismaClient } = require('@prisma/client');
const { generateAssetTag } = require('../utils/assetTagGenerator');
const ApiError = require('../utils/ApiError');
const prisma = new PrismaClient();

class AssetService {
  static async createAsset(tenantId, data) {
    const asset_tag = await generateAssetTag(tenantId, data.category_id);
    
    return prisma.asset.create({
      data: {
        ...data,
        asset_tag,
        organization_id: tenantId,
        status: 'available'
      }
    });
  }

  static async getAssets(tenantId, filters = {}) {
    return prisma.asset.findMany({
      where: {
        organization_id: tenantId,
        ...filters
      },
      include: {
        category: true,
        department: true
      }
    });
  }

  static async getAssetById(tenantId, assetId) {
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, organization_id: tenantId },
      include: {
        category: true,
        department: true,
        allocations: {
          where: { return_date: null },
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });

    if (!asset) throw new ApiError(404, 'NOT_FOUND', 'Asset not found');
    return asset;
  }

  static async updateAsset(tenantId, assetId, data) {
    const asset = await prisma.asset.findFirst({
      where: { id: assetId, organization_id: tenantId }
    });
    
    if (!asset) throw new ApiError(404, 'NOT_FOUND', 'Asset not found');

    return prisma.asset.update({
      where: { id: assetId },
      data
    });
  }
}

module.exports = AssetService;
