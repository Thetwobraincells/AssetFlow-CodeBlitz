const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const prisma = new PrismaClient();

class OrganizationService {
  // --- Departments ---
  static async createDepartment(tenantId, data) {
    const existing = await prisma.department.findUnique({
      where: {
        organization_id_name: { organization_id: tenantId, name: data.name }
      }
    });
    if (existing) throw new ApiError(409, 'UNIQUE_CONSTRAINT_FAILED', 'Department name already exists');

    const existingCode = await prisma.department.findUnique({
      where: {
        organization_id_code: { organization_id: tenantId, code: data.code }
      }
    });
    if (existingCode) throw new ApiError(409, 'UNIQUE_CONSTRAINT_FAILED', 'Department code already exists');

    return prisma.department.create({
      data: {
        ...data,
        organization_id: tenantId
      }
    });
  }

  static async getDepartments(tenantId) {
    return prisma.department.findMany({
      where: { organization_id: tenantId },
      include: { head_user: { select: { id: true, name: true, email: true } } }
    });
  }

  static async updateDepartment(tenantId, deptId, data) {
    const dept = await prisma.department.findFirst({
      where: { id: deptId, organization_id: tenantId }
    });
    if (!dept) throw new ApiError(404, 'NOT_FOUND', 'Department not found');

    return prisma.department.update({
      where: { id: deptId },
      data
    });
  }

  // --- Categories ---
  static async createCategory(tenantId, data) {
    return prisma.assetCategory.create({
      data: {
        ...data,
        organization_id: tenantId
      }
    });
  }

  static async getCategories(tenantId) {
    return prisma.assetCategory.findMany({
      where: { organization_id: tenantId }
    });
  }

  static async updateCategory(tenantId, catId, data) {
    const cat = await prisma.assetCategory.findFirst({
      where: { id: catId, organization_id: tenantId }
    });
    if (!cat) throw new ApiError(404, 'NOT_FOUND', 'Category not found');

    return prisma.assetCategory.update({
      where: { id: catId },
      data
    });
  }

  // --- Users Directory ---
  static async getUsers(tenantId) {
    return prisma.user.findMany({
      where: { organization_id: tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department_id: true,
        created_at: true,
        department: { select: { name: true } }
      }
    });
  }

  static async updateUserRole(tenantId, userId, role) {
    const user = await prisma.user.findFirst({
      where: { id: userId, organization_id: tenantId }
    });
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');

    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, role: true }
    });
  }

  static async updateUserStatus(tenantId, userId, status) {
    const user = await prisma.user.findFirst({
      where: { id: userId, organization_id: tenantId }
    });
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');

    return prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, name: true, status: true }
    });
  }
}

module.exports = OrganizationService;
