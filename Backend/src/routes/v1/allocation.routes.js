const express = require('express');
const AllocationController = require('../../controllers/allocation.controller');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');
const idempotencyMiddleware = require('../../middlewares/idempotency.middleware');
const { allocateAssetSchema, returnAssetSchema, transferAssetSchema } = require('../../validations/allocation.schema');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(idempotencyMiddleware);

// Admin or asset_manager can allocate and return
router.post(
  '/', 
  rbacMiddleware(['admin', 'asset_manager']), 
  validate(allocateAssetSchema), 
  AllocationController.allocateAsset
);

router.post(
  '/:id/return', 
  rbacMiddleware(['admin', 'asset_manager']), 
  validate(returnAssetSchema), 
  AllocationController.returnAsset
);

router.post(
  '/transfer', 
  rbacMiddleware(['admin', 'asset_manager']), 
  validate(transferAssetSchema), 
  AllocationController.transferAsset
);

module.exports = router;
