const OrganizationService = require('../services/organization.service');

class OrganizationController {
  // Departments
  static async createDepartment(req, res, next) {
    try {
      const dept = await OrganizationService.createDepartment(req.tenantId, req.body);
      res.status(201).json({ message: 'Department created successfully', data: dept });
    } catch (error) {
      next(error);
    }
  }

  static async getDepartments(req, res, next) {
    try {
      const depts = await OrganizationService.getDepartments(req.tenantId);
      res.status(200).json({ data: depts });
    } catch (error) {
      next(error);
    }
  }

  static async updateDepartment(req, res, next) {
    try {
      const dept = await OrganizationService.updateDepartment(req.tenantId, req.params.id, req.body);
      res.status(200).json({ message: 'Department updated successfully', data: dept });
    } catch (error) {
      next(error);
    }
  }

  // Categories
  static async createCategory(req, res, next) {
    try {
      const category = await OrganizationService.createCategory(req.tenantId, req.body);
      res.status(201).json({ message: 'Category created successfully', data: category });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await OrganizationService.getCategories(req.tenantId);
      res.status(200).json({ data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const category = await OrganizationService.updateCategory(req.tenantId, req.params.id, req.body);
      res.status(200).json({ message: 'Category updated successfully', data: category });
    } catch (error) {
      next(error);
    }
  }

  // Users
  static async getUsers(req, res, next) {
    try {
      const users = await OrganizationService.getUsers(req.tenantId);
      res.status(200).json({ data: users });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req, res, next) {
    try {
      const user = await OrganizationService.updateUserRole(req.tenantId, req.params.id, req.body.role);
      res.status(200).json({ message: 'User role updated', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req, res, next) {
    try {
      const user = await OrganizationService.updateUserStatus(req.tenantId, req.params.id, req.body.status);
      res.status(200).json({ message: 'User status updated', data: user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrganizationController;
