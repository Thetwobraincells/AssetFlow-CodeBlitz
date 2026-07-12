const { PrismaClient } = require('../../Backend/node_modules/.prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      primary_color: '#0052cc',
    },
  });
  console.log(`Organization created: ${org.name}`);

  // Create Departments
  const deptIT = await prisma.department.upsert({
    where: { organization_id_code: { organization_id: org.id, code: 'IT-01' } },
    update: {},
    create: {
      organization_id: org.id,
      name: 'Information Technology',
      code: 'IT-01',
    },
  });

  const deptHR = await prisma.department.upsert({
    where: { organization_id_code: { organization_id: org.id, code: 'HR-01' } },
    update: {},
    create: {
      organization_id: org.id,
      name: 'Human Resources',
      code: 'HR-01',
    },
  });
  console.log(`Departments created`);

  // Create Users
  const password_hash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { organization_id_email: { organization_id: org.id, email: 'admin@acmecorp.com' } },
    update: {},
    create: {
      organization_id: org.id,
      name: 'System Admin',
      email: 'admin@acmecorp.com',
      password_hash,
      role: 'admin',
      department_id: deptIT.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { organization_id_email: { organization_id: org.id, email: 'manager@acmecorp.com' } },
    update: {},
    create: {
      organization_id: org.id,
      name: 'Asset Manager',
      email: 'manager@acmecorp.com',
      password_hash,
      role: 'asset_manager',
      department_id: deptIT.id,
    },
  });

  const employee = await prisma.user.upsert({
    where: { organization_id_email: { organization_id: org.id, email: 'employee@acmecorp.com' } },
    update: {},
    create: {
      organization_id: org.id,
      name: 'John Doe',
      email: 'employee@acmecorp.com',
      password_hash,
      role: 'employee',
      department_id: deptHR.id,
    },
  });
  console.log(`Users created`);

  // Create Asset Categories
  const catLaptop = await prisma.assetCategory.upsert({
    where: { organization_id_name: { organization_id: org.id, name: 'Laptops' } },
    update: {},
    create: {
      organization_id: org.id,
      name: 'Laptops',
    },
  });

  const catMonitor = await prisma.assetCategory.upsert({
    where: { organization_id_name: { organization_id: org.id, name: 'Monitors' } },
    update: {},
    create: {
      organization_id: org.id,
      name: 'Monitors',
    },
  });
  console.log(`Asset Categories created`);

  // Create Assets
  const laptop1 = await prisma.asset.upsert({
    where: { organization_id_asset_tag: { organization_id: org.id, asset_tag: 'LPT-001' } },
    update: {},
    create: {
      organization_id: org.id,
      asset_tag: 'LPT-001',
      name: 'MacBook Pro 16"',
      category_id: catLaptop.id,
      serial_number: 'C02ZG000MD6M',
      acquisition_date: new Date('2023-01-15'),
      acquisition_cost: 2499.00,
      condition: 'excellent',
      location: 'HQ - IT Room',
      department_id: deptIT.id,
      status: 'available',
      created_by: admin.id,
    },
  });

  const monitor1 = await prisma.asset.upsert({
    where: { organization_id_asset_tag: { organization_id: org.id, asset_tag: 'MON-001' } },
    update: {},
    create: {
      organization_id: org.id,
      asset_tag: 'MON-001',
      name: 'Dell UltraSharp 27"',
      category_id: catMonitor.id,
      serial_number: 'CN-0WG20F-744',
      acquisition_date: new Date('2023-02-10'),
      acquisition_cost: 499.00,
      condition: 'good',
      location: 'HQ - Open Office',
      department_id: deptIT.id,
      status: 'available',
      created_by: admin.id,
    },
  });
  console.log(`Assets created`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
