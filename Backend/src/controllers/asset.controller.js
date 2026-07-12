const AssetService = require('../services/asset.service');

class AssetController {
  static async createAsset(req, res, next) {
    try {
      // If there's an image uploaded via Multer, save path
      const data = { ...req.body };
      if (req.file) {
        data.custom_attributes = data.custom_attributes || {};
        data.custom_attributes.image_path = req.file.path;
      }

      const asset = await AssetService.createAsset(req.tenantId, data);
      res.status(201).json({ message: 'Asset created successfully', data: asset });
    } catch (error) {
      next(error);
    }
  }

  static async getAssets(req, res, next) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.department_id) filters.department_id = req.query.department_id;
      if (req.query.category_id) filters.category_id = req.query.category_id;

      const assets = await AssetService.getAssets(req.tenantId, filters);
      res.status(200).json({ data: assets });
    } catch (error) {
      next(error);
    }
  }

  static async getAssetById(req, res, next) {
    try {
      const asset = await AssetService.getAssetById(req.tenantId, req.params.id);
      res.status(200).json({ data: asset });
    } catch (error) {
      next(error);
    }
  }

  static async updateAsset(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.custom_attributes = data.custom_attributes || {};
        data.custom_attributes.image_path = req.file.path;
      }

      const asset = await AssetService.updateAsset(req.tenantId, req.params.id, data);
      res.status(200).json({ message: 'Asset updated successfully', data: asset });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AssetController;
