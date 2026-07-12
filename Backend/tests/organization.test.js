const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    department: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    assetCategory: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient();

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ userId: 'user-1', role: 'admin', organization_id: 'org-1' }),
  sign: jest.fn()
}));

describe('Organization API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/departments', () => {
    it('should return a list of departments for the organization', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'admin',
        organization_id: 'org-1',
        status: 'active'
      });

      prisma.department.findMany.mockResolvedValue([
        { id: 'dept-1', name: 'IT', code: 'IT-01', organization_id: 'org-1' }
      ]);

      const res = await request(app)
        .get('/api/v1/departments')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('IT');
    });
  });

  describe('POST /api/v1/departments', () => {
    it('should allow admin to create a department', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'admin',
        organization_id: 'org-1',
        status: 'active'
      });

      prisma.department.findUnique.mockResolvedValue(null);
      prisma.department.create.mockResolvedValue({
        id: 'dept-1',
        name: 'HR',
        code: 'HR-01',
        organization_id: 'org-1'
      });

      const res = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', 'Bearer fake-token')
        .send({
          name: 'HR',
          code: 'HR-01'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('HR');
    });
  });
});
