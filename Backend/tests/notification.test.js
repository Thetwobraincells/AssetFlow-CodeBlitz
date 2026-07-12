const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    notification: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ userId: 'user-1', role: 'admin', organization_id: 'org-1' }),
  sign: jest.fn()
}));

const prisma = new PrismaClient();

describe('Notification API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1', role: 'admin', organization_id: 'org-1', status: 'active'
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('should return all notifications for the user', async () => {
      prisma.notification.findMany.mockResolvedValue([
        { id: 'notif-1', type: 'maintenance_approved', message: 'Maintenance approved', is_read: false },
        { id: 'notif-2', type: 'audit_discrepancy', message: 'Audit closed', is_read: true }
      ]);

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('should filter unread notifications when unread=true', async () => {
      prisma.notification.findMany.mockResolvedValue([
        { id: 'notif-1', type: 'maintenance_approved', message: 'Maintenance approved', is_read: false }
      ]);

      const res = await request(app)
        .get('/api/v1/notifications?unread=true')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ is_read: false })
        })
      );
    });
  });

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('should mark a notification as read', async () => {
      prisma.notification.findFirst.mockResolvedValue({
        id: 'notif-1', user_id: 'user-1', organization_id: 'org-1'
      });
      prisma.notification.update.mockResolvedValue({
        id: 'notif-1', is_read: true
      });

      const res = await request(app)
        .patch('/api/v1/notifications/notif-1/read')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.is_read).toBe(true);
    });

    it('should return 404 for notification not belonging to user', async () => {
      prisma.notification.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/v1/notifications/notif-999/read')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const res = await request(app)
        .post('/api/v1/notifications/read-all')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.count).toBe(5);
    });
  });
});
