const express = require('express');
const AuditController = require('../../controllers/audit.controller');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');
const { createAuditCycleSchema, verifyAuditItemSchema } = require('../../validations/audit.schema');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Only admin can manage audit cycles
router.get('/', rbacMiddleware(['admin']), AuditController.getCycles);
router.get('/:id', rbacMiddleware(['admin']), AuditController.getCycleById);
router.post('/', rbacMiddleware(['admin']), validate(createAuditCycleSchema), AuditController.createCycle);
router.post('/:id/close', rbacMiddleware(['admin']), AuditController.closeCycle);

// Admin or asset_manager can verify items
router.patch(
  '/:cycleId/items/:itemId/verify',
  rbacMiddleware(['admin', 'asset_manager']),
  validate(verifyAuditItemSchema),
  AuditController.verifyItem
);

module.exports = router;
