const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateAssetTag = async (tenantId, categoryId) => {
  // Simple tag generator: PREFIX-0001
  // Could be improved with category-specific prefixes
  const count = await prisma.asset.count({
    where: { organization_id: tenantId }
  });
  
  const nextNum = (count + 1).toString().padStart(5, '0');
  return `AST-${nextNum}`;
};

module.exports = { generateAssetTag };
