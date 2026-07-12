const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

require('dotenv').config();
const prisma = new PrismaClient({});

async function main() {
  console.log('Start seeding...');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Tech Innovators Inc.',
      slug: 'tech-innovators',
      primary_color: '#4F46E5',
    },
  });
  console.log(`Created Organization: ${org.name}`);

  // 2. Create Admin User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.create({
    data: {
      organization_id: org.id,
      email: 'admin@techinnovators.com',
      password_hash: hashedPassword,
      name: 'Alice Admin',
      role: 'admin',
    },
  });
  console.log(`Created Admin User: ${admin.email}`);

  // 3. Create Departments
  const deptEngineering = await prisma.department.create({
    data: {
      organization_id: org.id,
      name: 'Engineering',
      code: 'ENG',
      head_user_id: admin.id,
    },
  });
  console.log(`Created Department: Engineering`);

  const deptDesign = await prisma.department.create({
    data: {
      organization_id: org.id,
      name: 'Design',
      code: 'DES',
    },
  });
  console.log(`Created Department: Design`);

  // 4. Create Asset Categories
  const catLaptops = await prisma.assetCategory.create({
    data: {
      organization_id: org.id,
      name: 'Laptops',
    },
  });
  const catMonitors = await prisma.assetCategory.create({
    data: {
      organization_id: org.id,
      name: 'Monitors',
    },
  });
  console.log(`Created Asset Categories`);

  // 5. Create Assets
  const asset1 = await prisma.asset.create({
    data: {
      organization_id: org.id,
      category_id: catLaptops.id,
      name: 'MacBook Pro 16"',
      asset_tag: 'AF-1001',
      serial_number: 'C02XXXXX01',
      department_id: deptEngineering.id,
      status: 'available',
      condition: 'new',
      location: 'HQ - Floor 3',
      acquisition_date: new Date('2023-01-15'),
      acquisition_cost: 2500,
      created_by: admin.id,
    },
  });
  const asset2 = await prisma.asset.create({
    data: {
      organization_id: org.id,
      category_id: catLaptops.id,
      name: 'Dell XPS 15',
      asset_tag: 'AF-1002',
      serial_number: 'DELXXXXX02',
      department_id: deptEngineering.id,
      status: 'allocated',
      condition: 'good',
      location: 'HQ - Floor 3',
      acquisition_date: new Date('2022-05-10'),
      acquisition_cost: 1800,
      created_by: admin.id,
    },
  });
  const asset3 = await prisma.asset.create({
    data: {
      organization_id: org.id,
      category_id: catMonitors.id,
      name: 'LG UltraFine 4K',
      asset_tag: 'AF-2001',
      serial_number: 'LGXXXXX01',
      department_id: deptDesign.id,
      status: 'available',
      condition: 'new',
      location: 'HQ - Floor 2',
      acquisition_date: new Date('2023-08-20'),
      acquisition_cost: 700,
      is_bookable: true,
      created_by: admin.id,
    },
  });
  console.log(`Created Assets`);

  // 6. Create Employee User
  const employee = await prisma.user.create({
    data: {
      organization_id: org.id,
      department_id: deptEngineering.id,
      email: 'bob@techinnovators.com',
      password_hash: hashedPassword,
      name: 'Bob Builder',
      role: 'employee',
    },
  });
  console.log(`Created Employee User: ${employee.email}`);

  // 7. Create Allocation
  await prisma.allocation.create({
    data: {
      organization_id: org.id,
      asset_id: asset2.id,
      employee_id: employee.id,
      allocated_by: admin.id,
      allocation_date: new Date(),
      status: 'active',
      condition_notes: 'Minor scratch on the bottom',
    },
  });
  console.log(`Created Allocation for Bob`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
