const AllocationService = require('../services/allocation.service');

class AllocationController {
  static async allocateAsset(req, res, next) {
    try {
      const allocation = await AllocationService.allocateAsset(req.tenantId, req.body, req.user.id);
      res.status(201).json({ message: 'Asset allocated successfully', data: allocation });
    } catch (error) {
      next(error);
    }
  }

  static async returnAsset(req, res, next) {
    try {
      const allocation = await AllocationService.returnAsset(req.tenantId, req.params.id, req.body);
      res.status(200).json({ message: 'Asset returned successfully', data: allocation });
    } catch (error) {
      next(error);
    }
  }

  static async transferAsset(req, res, next) {
    try {
      const allocation = await AllocationService.transferAsset(req.tenantId, req.body, req.user.id);
      res.status(200).json({ message: 'Asset transferred successfully', data: allocation });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AllocationController;
