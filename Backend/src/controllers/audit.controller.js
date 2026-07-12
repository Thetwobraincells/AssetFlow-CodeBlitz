const AuditService = require('../services/audit.service');

class AuditController {
  static async createCycle(req, res, next) {
    try {
      const cycle = await AuditService.createCycle(req.tenantId, req.user.id, req.body);
      res.status(201).json({ message: 'Audit cycle created', data: cycle });
    } catch (error) {
      next(error);
    }
  }

  static async getCycles(req, res, next) {
    try {
      const cycles = await AuditService.getCycles(req.tenantId);
      res.status(200).json({ data: cycles });
    } catch (error) {
      next(error);
    }
  }

  static async getCycleById(req, res, next) {
    try {
      const cycle = await AuditService.getCycleById(req.tenantId, req.params.id);
      res.status(200).json({ data: cycle });
    } catch (error) {
      next(error);
    }
  }

  static async verifyItem(req, res, next) {
    try {
      const item = await AuditService.verifyItem(
        req.tenantId, req.user.id, req.params.cycleId, req.params.itemId, req.body
      );
      res.status(200).json({ message: 'Audit item verified', data: item });
    } catch (error) {
      next(error);
    }
  }

  static async closeCycle(req, res, next) {
    try {
      const cycle = await AuditService.closeCycle(req.tenantId, req.user.id, req.params.id);
      res.status(200).json({ message: 'Audit cycle closed', data: cycle });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuditController;
