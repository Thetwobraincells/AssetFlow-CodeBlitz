const MaintenanceService = require('../services/maintenance.service');

class MaintenanceController {
  static async createRequest(req, res, next) {
    try {
      const request = await MaintenanceService.createRequest(req.tenantId, req.user.id, req.body);
      res.status(201).json({ message: 'Maintenance request created', data: request });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const request = await MaintenanceService.updateStatus(
        req.tenantId, req.user.id, req.params.id, req.body
      );
      res.status(200).json({ message: 'Maintenance request updated', data: request });
    } catch (error) {
      next(error);
    }
  }

  static async getRequests(req, res, next) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.priority) filters.priority = req.query.priority;
      if (req.query.asset_id) filters.asset_id = req.query.asset_id;

      const requests = await MaintenanceService.getRequests(req.tenantId, filters);
      res.status(200).json({ data: requests });
    } catch (error) {
      next(error);
    }
  }

  static async getRequestById(req, res, next) {
    try {
      const request = await MaintenanceService.getRequestById(req.tenantId, req.params.id);
      res.status(200).json({ data: request });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MaintenanceController;
