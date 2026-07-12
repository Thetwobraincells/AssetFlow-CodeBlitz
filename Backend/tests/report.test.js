const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    asset: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn()
    },
    assetCategory: {
      findMany: jest.fn()
    },
    maintenanceRequest: {
      groupBy: jest.fn(),
      findMany: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    organization: {
      findUnique: jest.fn()
    },
    $disconnect: jest.fn()
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient();

describe('Report & Analytics Endpoints', () => {
  let adminToken;
  let organizationId = 'org-1';

  beforeAll(() => {
    adminToken = jwt.sign(
      { userId: 'user-1', organizationId: organizationId, role: 'admin' },
      process.env.JWT_SECRET || 'super-secret-jwt-key'
    );
    
    // Mock user for auth middleware
    prisma.user.findUnique.mockImplementation(async (args) => {
      if (args.where.id === 'user-1') {
        return { id: 'user-1', organization_id: organizationId, role: 'admin' };
      }
      if (args.where.id === 'user-2') {
        return { id: 'user-2', organization_id: organizationId, role: 'employee' };
      }
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/v1/reports/kpis should return dashboard metrics', async () => {
    // Mock sequential counts
    prisma.asset.count
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(5)  // available
      .mockResolvedValueOnce(3)  // allocated
      .mockResolvedValueOnce(1)  // under_maintenance
      .mockResolvedValueOnce(1); // lost

    const res = await request(app)
      .get('/api/v1/reports/kpis')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.total_assets).toBe(10);
    expect(res.body.data.status_breakdown.available).toBe(5);
    expect(res.body.data.status_breakdown.allocated).toBe(3);
    expect(res.body.data.status_breakdown.under_maintenance).toBe(1);
    expect(res.body.data.status_breakdown.lost).toBe(1);
    expect(res.body.data.utilization_rate).toBe(30); // 3/10 * 100
  });

  it('GET /api/v1/reports/utilization should return utilization by category', async () => {
    prisma.asset.groupBy.mockResolvedValue([
      { category_id: 'cat-1', status: 'allocated', _count: { id: 2 } },
      { category_id: 'cat-1', status: 'available', _count: { id: 3 } }
    ]);
    prisma.assetCategory.findMany.mockResolvedValue([
      { id: 'cat-1', name: 'Laptops' }
    ]);

    const res = await request(app)
      .get('/api/v1/reports/utilization')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const categoryReport = res.body.data[0];
    expect(categoryReport.category_name).toBe('Laptops');
    expect(categoryReport.total).toBe(5);
    expect(categoryReport.allocated).toBe(2);
    expect(categoryReport.utilization_rate).toBe(40);
  });

  it('GET /api/v1/reports/maintenance-frequency should return top maintained assets', async () => {
    prisma.maintenanceRequest.groupBy.mockResolvedValue([
      { asset_id: 'asset-1', _count: { id: 4 } }
    ]);
    prisma.asset.findMany.mockResolvedValue([
      { id: 'asset-1', name: 'MacBook Pro', asset_tag: 'TAG-101' }
    ]);

    const res = await request(app)
      .get('/api/v1/reports/maintenance-frequency')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].maintenance_count).toBe(4);
    expect(res.body.data[0].asset.name).toBe('MacBook Pro');
  });

  it('GET /api/v1/reports/idle-assets should return available older assets', async () => {
    prisma.asset.findMany.mockResolvedValue([
      { id: 'asset-1', name: 'Old Desktop', asset_tag: 'TAG-999', acquisition_date: new Date('2020-01-01') }
    ]);

    const res = await request(app)
      .get('/api/v1/reports/idle-assets')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].asset_tag).toBe('TAG-999');
  });

  it('Should block regular users from accessing reports', async () => {
    const userToken = jwt.sign(
      { userId: 'user-2', organizationId: organizationId, role: 'employee' },
      process.env.JWT_SECRET || 'super-secret-jwt-key'
    );



    const res = await request(app)
      .get('/api/v1/reports/kpis')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});
