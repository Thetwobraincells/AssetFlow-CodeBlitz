const ApiError = require('../utils/ApiError');

// Simple in-memory idempotency store
// In production, this should be Redis or a database table
const idempotencyStore = new Map();

const idempotencyMiddleware = (req, res, next) => {
  try {
    // Only apply to POST requests for safety, typically mutations
    if (req.method !== 'POST') {
      return next();
    }

    const idempotencyKey = req.headers['x-idempotency-key'];
    
    if (!idempotencyKey) {
      return next();
    }

    // Combine user ID and key to ensure uniqueness per user
    const storeKey = `${req.user.id}:${idempotencyKey}`;

    if (idempotencyStore.has(storeKey)) {
      const storedResponse = idempotencyStore.get(storeKey);
      return res.status(storedResponse.status).json(storedResponse.body);
    }

    // Hook into response to save it once it's sent
    const originalJson = res.json;
    res.json = function(body) {
      idempotencyStore.set(storeKey, {
        status: res.statusCode,
        body
      });
      
      // Clean up after 24h
      setTimeout(() => {
        idempotencyStore.delete(storeKey);
      }, 24 * 60 * 60 * 1000);

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = idempotencyMiddleware;
