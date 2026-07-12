const express = require('express');
const AssetController = require('../../controllers/asset.controller');
const validate = require('../../middlewares/validate.middleware');
const uploadMiddleware = require('../../middlewares/upload.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');
const { createAssetSchema, updateAssetSchema } = require('../../validations/asset.schema');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Get all assets (open to all authenticated users in tenant)
router.get('/', AssetController.getAssets);
router.get('/:id', AssetController.getAssetById);

// Create and update restricted to admin and asset_manager
router.post(
  '/', 
  rbacMiddleware(['admin', 'asset_manager']), 
  uploadMiddleware.single('image'), 
  validate(createAssetSchema), 
  AssetController.createAsset
);

router.patch(
  '/:id', 
  rbacMiddleware(['admin', 'asset_manager']), 
  uploadMiddleware.single('image'), 
  validate(updateAssetSchema), 
  AssetController.updateAsset
);

module.exports = router;
