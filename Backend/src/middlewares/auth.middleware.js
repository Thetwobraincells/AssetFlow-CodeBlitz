const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Missing or invalid authorization token');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || user.status === 'inactive') {
        throw new ApiError(401, 'UNAUTHORIZED', 'User not found or inactive');
      }

      req.user = user;
      next();
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired token');
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
