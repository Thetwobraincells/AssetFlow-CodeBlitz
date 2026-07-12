const express = require('express');
const MaintenanceController = require('../../controllers/maintenance.controller');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');
const { createMaintenanceSchema, updateMaintenanceStatusSchema } = require('../../validations/maintenance.schema');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Any authenticated user can view maintenance requests
router.get('/', MaintenanceController.getRequests);
router.get('/:id', MaintenanceController.getRequestById);

// Any authenticated user can raise a maintenance request
router.post('/', validate(createMaintenanceSchema), MaintenanceController.createRequest);

// Only admin or asset_manager can approve/assign/resolve/reject
router.patch(
  '/:id/status',
  rbacMiddleware(['admin', 'asset_manager']),
  validate(updateMaintenanceStatusSchema),
  MaintenanceController.updateStatus
);

module.exports = router;
