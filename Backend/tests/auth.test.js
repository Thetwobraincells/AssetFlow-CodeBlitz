const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    organization: {
      create: jest.fn(),
    }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient();
// We also need to mock jsonwebtoken and bcrypt if we don't want to actually run them, 
// but they run fast enough to not need mocking, except prisma which touches DB.
// Actually, bcrypt hash takes time. Let's mock it for speed.
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}));2

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should create a new organization and admin user', async () => {
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });
      
      prisma.organization.create.mockResolvedValue({ id: 'org-1', name: 'Test Org' });
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        name: 'John',
        email: 'john@test.com',
        role: 'admin',
        organization_id: 'org-1'
      });

      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          name: 'John',
          email: 'john@test.com',
          password: 'password123',
          organization_name: 'Test Org'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User created successfully');
      expect(res.body.data.email).toBe('john@test.com');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return a token for valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        name: 'John',
        email: 'john@test.com',
        role: 'admin',
        organization_id: 'org-1',
        status: 'active',
        password_hash: 'hashed_password'
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });
  });
});
