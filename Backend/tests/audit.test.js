const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    $transaction: jest.fn(),
    auditCycle: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    auditItem: {
      createMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    asset: {
      findMany: jest.fn(),
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

describe('Audit API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1', role: 'admin', organization_id: 'org-1', status: 'active'
    });
  });

  describe('POST /api/v1/audits', () => {
    it('should create an audit cycle and snapshot assets as items', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.asset.findMany.mockResolvedValue([
        { id: 'asset-1', status: 'available', location: 'Building A' },
        { id: 'asset-2', status: 'allocated', location: 'Building B' }
      ]);
      prisma.auditCycle.create.mockResolvedValue({
        id: 'cycle-1', name: 'Q3 Audit', status: 'draft',
        organization_id: 'org-1',
        date_range_start: '2026-07-01', date_range_end: '2026-07-31'
      });
      prisma.auditItem.createMany.mockResolvedValue({ count: 2 });

      const res = await request(app)
        .post('/api/v1/audits')
        .set('Authorization', 'Bearer fake-token')
        .send({
          name: 'Q3 Audit',
          date_range_start: '2026-07-01',
          date_range_end: '2026-07-31'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.items_created).toBe(2);
      expect(prisma.auditItem.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ asset_id: 'asset-1', verification_status: 'pending' })
          ])
        })
      );
    });

    it('should reject when no assets to audit', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.asset.findMany.mockResolvedValue([]);

      const res = await request(app)
        .post('/api/v1/audits')
        .set('Authorization', 'Bearer fake-token')
        .send({
          name: 'Empty Audit',
          date_range_start: '2026-07-01',
          date_range_end: '2026-07-31'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/v1/audits/:cycleId/items/:itemId/verify', () => {
    it('should verify an audit item', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.auditCycle.findFirst.mockResolvedValue({
        id: 'cycle-1', status: 'active', organization_id: 'org-1'
      });
      prisma.auditItem.findFirst.mockResolvedValue({
        id: 'item-1', audit_cycle_id: 'cycle-1', verification_status: 'pending'
      });
      prisma.auditItem.update.mockResolvedValue({
        id: 'item-1', verification_status: 'verified', verified_by: 'user-1'
      });

      const res = await request(app)
        .patch('/api/v1/audits/cycle-1/items/item-1/verify')
        .set('Authorization', 'Bearer fake-token')
        .send({ status: 'verified', notes: 'Confirmed on desk' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.verification_status).toBe('verified');
    });

    it('should reject re-verifying an already verified item', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.auditCycle.findFirst.mockResolvedValue({
        id: 'cycle-1', status: 'active', organization_id: 'org-1'
      });
      prisma.auditItem.findFirst.mockResolvedValue({
        id: 'item-1', audit_cycle_id: 'cycle-1', verification_status: 'verified'
      });

      const res = await request(app)
        .patch('/api/v1/audits/cycle-1/items/item-1/verify')
        .set('Authorization', 'Bearer fake-token')
        .send({ status: 'missing' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('already been verified');
    });
  });

  describe('POST /api/v1/audits/:id/close', () => {
    it('should close cycle and flip missing assets to lost', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.auditCycle.findFirst.mockResolvedValue({
        id: 'cycle-1', name: 'Q3 Audit', status: 'active', organization_id: 'org-1',
        items: [
          { id: 'item-1', asset_id: 'asset-1', verification_status: 'verified' },
          { id: 'item-2', asset_id: 'asset-2', verification_status: 'missing' }
        ]
      });
      prisma.asset.update.mockResolvedValue({});
      prisma.user.findMany.mockResolvedValue([
        { id: 'user-1', role: 'admin', status: 'active' }
      ]);
      prisma.notification.create.mockResolvedValue({});
      prisma.auditCycle.update.mockResolvedValue({
        id: 'cycle-1', status: 'closed', closed_at: new Date()
      });

      const res = await request(app)
        .post('/api/v1/audits/cycle-1/close')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.assets_marked_lost).toBe(1);
      // Verify asset-2 was set to 'lost'
      expect(prisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'asset-2' },
          data: { status: 'lost' }
        })
      );
    });

    it('should reject closing with pending items', async () => {
      prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
      prisma.auditCycle.findFirst.mockResolvedValue({
        id: 'cycle-1', name: 'Q3 Audit', status: 'active', organization_id: 'org-1',
        items: [
          { id: 'item-1', asset_id: 'asset-1', verification_status: 'verified' },
          { id: 'item-2', asset_id: 'asset-2', verification_status: 'pending' }
        ]
      });

      const res = await request(app)
        .post('/api/v1/audits/cycle-1/close')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toContain('1 items still pending');
    });
  });
});
