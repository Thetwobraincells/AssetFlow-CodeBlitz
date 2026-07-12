const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReportService {
  /**
   * Get high-level KPI dashboard metrics for a tenant
   */
  static async getDashboardKPIs(tenantId) {
    const [totalAssets, availableAssets, allocatedAssets, maintenanceAssets, lostAssets] = await Promise.all([
      prisma.asset.count({ where: { organization_id: tenantId, status: { not: 'retired' } } }),
      prisma.asset.count({ where: { organization_id: tenantId, status: 'available' } }),
      prisma.asset.count({ where: { organization_id: tenantId, status: 'allocated' } }),
      prisma.asset.count({ where: { organization_id: tenantId, status: 'under_maintenance' } }),
      prisma.asset.count({ where: { organization_id: tenantId, status: 'lost' } })
    ]);

    const utilizationRate = totalAssets > 0 ? (allocatedAssets / totalAssets) * 100 : 0;

    return {
      total_assets: totalAssets,
      status_breakdown: {
        available: availableAssets,
        allocated: allocatedAssets,
        under_maintenance: maintenanceAssets,
        lost: lostAssets
      },
      utilization_rate: parseFloat(utilizationRate.toFixed(2))
    };
  }

  /**
   * Get asset utilization report (grouped by category)
   */
  static async getUtilizationByCategory(tenantId) {
    const grouped = await prisma.asset.groupBy({
      by: ['category_id', 'status'],
      where: { organization_id: tenantId, status: { not: 'retired' } },
      _count: {
        id: true
      }
    });

    const categories = await prisma.assetCategory.findMany({
      where: { organization_id: tenantId }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {});

    const report = {};
    for (const group of grouped) {
      const catId = group.category_id;
      const catName = categoryMap[catId] || 'Unknown';
      const status = group.status;
      const count = group._count.id;

      if (!report[catId]) {
        report[catId] = {
          category_id: catId,
          category_name: catName,
          total: 0,
          allocated: 0,
          available: 0,
          under_maintenance: 0,
          other: 0
        };
      }

      report[catId].total += count;
      if (status === 'allocated') report[catId].allocated += count;
      else if (status === 'available') report[catId].available += count;
      else if (status === 'under_maintenance') report[catId].under_maintenance += count;
      else report[catId].other += count;
    }

    return Object.values(report).map(cat => ({
      ...cat,
      utilization_rate: cat.total > 0 ? parseFloat(((cat.allocated / cat.total) * 100).toFixed(2)) : 0
    })).sort((a, b) => b.utilization_rate - a.utilization_rate);
  }

  /**
   * Get maintenance frequency report
   */
  static async getMaintenanceFrequency(tenantId) {
    // Count maintenance requests per asset
    const frequency = await prisma.maintenanceRequest.groupBy({
      by: ['asset_id'],
      where: { organization_id: tenantId },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Fetch asset details for the top assets
    const assetIds = frequency.map(f => f.asset_id);
    const assets = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
      select: { id: true, name: true, asset_tag: true }
    });

    const assetMap = assets.reduce((acc, asset) => {
      acc[asset.id] = asset;
      return acc;
    }, {});

    return frequency.map(f => ({
      asset: assetMap[f.asset_id],
      maintenance_count: f._count.id
    }));
  }

  /**
   * Get idle assets (available status, acquired more than 30 days ago, no recent allocations)
   * A simplistic approach: assets that are 'available' and have not been allocated recently.
   */
  static async getIdleAssets(tenantId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const idleAssets = await prisma.asset.findMany({
      where: {
        organization_id: tenantId,
        status: 'available',
        acquisition_date: {
          lt: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        asset_tag: true,
        name: true,
        acquisition_date: true
      },
      take: 20
    });

    return idleAssets;
  }
}

module.exports = ReportService;
