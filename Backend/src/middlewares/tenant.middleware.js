const ApiError = require('../utils/ApiError');

const tenantMiddleware = (req, res, next) => {
  try {
    if (!req.user || !req.user.organization_id) {
      throw new ApiError(401, 'UNAUTHORIZED', 'User organization context missing');
    }

    req.tenantId = req.user.organization_id;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = tenantMiddleware;
