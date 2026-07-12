const ReportService = require('../services/report.service');

class ReportController {
  static async getDashboardKPIs(req, res, next) {
    try {
      const data = await ReportService.getDashboardKPIs(req.tenantId);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getUtilization(req, res, next) {
    try {
      const data = await ReportService.getUtilizationByCategory(req.tenantId);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getMaintenanceFrequency(req, res, next) {
    try {
      const data = await ReportService.getMaintenanceFrequency(req.tenantId);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getIdleAssets(req, res, next) {
    try {
      const data = await ReportService.getIdleAssets(req.tenantId);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;
