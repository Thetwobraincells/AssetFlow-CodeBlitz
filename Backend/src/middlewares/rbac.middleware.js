const ApiError = require('../utils/ApiError');

const rbacMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        throw new ApiError(401, 'UNAUTHORIZED', 'User not authenticated');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(403, 'FORBIDDEN', 'User does not have sufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = rbacMiddleware;
