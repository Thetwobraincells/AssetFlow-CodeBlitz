const express = require('express');
const OrganizationController = require('../../controllers/organization.controller');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const rbacMiddleware = require('../../middlewares/rbac.middleware');
const {
  createDepartmentSchema,
  updateDepartmentSchema,
  createCategorySchema,
  updateCategorySchema
} = require('../../validations/organization.schema');
const { updateRoleSchema, updateStatusSchema } = require('../../validations/user.schema');

const router = express.Router();

// Apply to all org routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// --- Departments ---
// Any authenticated can GET
router.get('/departments', OrganizationController.getDepartments);
// Admin only for POST/PATCH
router.post('/departments', rbacMiddleware(['admin']), validate(createDepartmentSchema), OrganizationController.createDepartment);
router.patch('/departments/:id', rbacMiddleware(['admin']), validate(updateDepartmentSchema), OrganizationController.updateDepartment);

// --- Categories ---
router.get('/categories', OrganizationController.getCategories);
router.post('/categories', rbacMiddleware(['admin']), validate(createCategorySchema), OrganizationController.createCategory);
router.patch('/categories/:id', rbacMiddleware(['admin']), validate(updateCategorySchema), OrganizationController.updateCategory);

// --- Users Directory ---
// Admin only
router.get('/users', rbacMiddleware(['admin']), OrganizationController.getUsers);
router.patch('/users/:id/role', rbacMiddleware(['admin']), validate(updateRoleSchema), OrganizationController.updateUserRole);
router.patch('/users/:id/status', rbacMiddleware(['admin']), validate(updateStatusSchema), OrganizationController.updateUserStatus);

module.exports = router;
