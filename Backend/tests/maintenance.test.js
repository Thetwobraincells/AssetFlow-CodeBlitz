const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    $transaction: jest.fn(),
    maintenanceRequest: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    asset: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ userId: 'user-1', role: 'admin', organization_id: 'org-1' }),
  sign: jest.fn()
}));

const prisma = new PrismaClient();

describe('Maintenance API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Auth middleware mock: user lookup
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1', role: 'admin', organization_id: 'org-1', status: 'active'
    });
  });

  describe('POST /api/v1/maintenance', () => {
    it('should create a maintenance request and set asset to under_maintenance', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.asset.findFirst.mockResolvedValue({
        id: 'asset-1', name: 'Laptop-01', asset_tag: 'AST-00001',
        status: 'available', organization_id: 'org-1'
      });
      prisma.maintenanceRequest.create.mockResolvedValue({
        id: 'maint-1', asset_id: 'asset-1', issue_description: 'Screen broken',
        status: 'pending', priority: 'high', organization_id: 'org-1'
      });
      prisma.asset.update.mockResolvedValue({});
      prisma.user.findMany.mockResolvedValue([
        { id: 'user-1', role: 'admin', status: 'active' }
      ]);
      prisma.notification.create.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', 'Bearer fake-token')
        .send({ asset_id: 'asset-1', issue_description: 'Screen broken', priority: 'high' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.status).toBe('pending');
      expect(prisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'under_maintenance' } })
      );
    });

    it('should reject maintenance for a retired asset', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.asset.findFirst.mockResolvedValue({
        id: 'asset-1', status: 'retired', organization_id: 'org-1'
      });

      const res = await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', 'Bearer fake-token')
        .send({ asset_id: 'asset-1', issue_description: 'Fix it' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/v1/maintenance/:id/status', () => {
    it('should transition from pending to approved', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.maintenanceRequest.findFirst.mockResolvedValue({
        id: 'maint-1', status: 'pending', asset_id: 'asset-1',
        raised_by: 'user-2', issue_description: 'Screen broken', organization_id: 'org-1',
        asset: { id: 'asset-1', name: 'Laptop-01', asset_tag: 'AST-00001' }
      });
      prisma.maintenanceRequest.update.mockResolvedValue({
        id: 'maint-1', status: 'approved'
      });
      prisma.notification.create.mockResolvedValue({});

      const res = await request(app)
        .patch('/api/v1/maintenance/maint-1/status')
        .set('Authorization', 'Bearer fake-token')
        .send({ status: 'approved' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('approved');
    });

    it('should reject invalid state transitions', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.maintenanceRequest.findFirst.mockResolvedValue({
        id: 'maint-1', status: 'pending', asset_id: 'asset-1',
        raised_by: 'user-2', issue_description: 'Screen broken', organization_id: 'org-1',
        asset: { id: 'asset-1', name: 'Laptop-01', asset_tag: 'AST-00001' }
      });

      const res = await request(app)
        .patch('/api/v1/maintenance/maint-1/status')
        .set('Authorization', 'Bearer fake-token')
        .send({ status: 'resolved' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('should set asset back to available on resolve', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.maintenanceRequest.findFirst.mockResolvedValue({
        id: 'maint-1', status: 'in_progress', asset_id: 'asset-1',
        raised_by: 'user-2', issue_description: 'Screen broken', organization_id: 'org-1',
        asset: { id: 'asset-1', name: 'Laptop-01', asset_tag: 'AST-00001' }
      });
      prisma.maintenanceRequest.update.mockResolvedValue({
        id: 'maint-1', status: 'resolved'
      });
      prisma.asset.update.mockResolvedValue({});
      prisma.notification.create.mockResolvedValue({});

      const res = await request(app)
        .patch('/api/v1/maintenance/maint-1/status')
        .set('Authorization', 'Bearer fake-token')
        .send({ status: 'resolved', resolution_notes: 'Replaced screen' });

      expect(res.statusCode).toBe(200);
      expect(prisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'available' } })
      );
    });
  });

  describe('GET /api/v1/maintenance', () => {
    it('should return all maintenance requests for the tenant', async () => {
      prisma.maintenanceRequest.findMany.mockResolvedValue([
        { id: 'maint-1', issue_description: 'Screen broken', status: 'pending' },
        { id: 'maint-2', issue_description: 'Battery issue', status: 'approved' }
      ]);

      const res = await request(app)
        .get('/api/v1/maintenance')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });
});
