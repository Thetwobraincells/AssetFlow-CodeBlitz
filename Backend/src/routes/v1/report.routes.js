const express = require('express');
const ReportController = require('../../controllers/report.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Only admins and department heads can view reports
router.use(rbacMiddleware(['admin', 'department_head']));

router.get('/kpis', ReportController.getDashboardKPIs);
router.get('/utilization', ReportController.getUtilization);
router.get('/maintenance-frequency', ReportController.getMaintenanceFrequency);
router.get('/idle-assets', ReportController.getIdleAssets);

module.exports = router;
