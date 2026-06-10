import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { loadEnvFile } from 'node:process';

loadEnvFile('../../.env');

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run the seed script.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const seedUserEmail = 'daniel.alvarez@example.com';
const seedWorkspaceName = 'Propiedades Morelia';

async function clearSeedData() {
  const seedUser = await prisma.user.findUnique({
    where: { email: seedUserEmail },
    include: { memberships: true },
  });

  const seedWorkspace = await prisma.workspace.findFirst({
    where: { name: seedWorkspaceName },
  });

  const workspaceIds = new Set<string>();

  if (seedWorkspace) {
    workspaceIds.add(seedWorkspace.id);
  }

  for (const membership of seedUser?.memberships ?? []) {
    workspaceIds.add(membership.workspaceId);
  }

  for (const workspaceId of workspaceIds) {
    await prisma.payment.deleteMany({ where: { workspaceId } });
    await prisma.rentCharge.deleteMany({ where: { workspaceId } });
    await prisma.expense.deleteMany({ where: { workspaceId } });
    await prisma.contract.deleteMany({ where: { workspaceId } });
    await prisma.tenant.deleteMany({ where: { workspaceId } });
    await prisma.unit.deleteMany({ where: { workspaceId } });
    await prisma.property.deleteMany({ where: { workspaceId } });
    await prisma.workspaceMember.deleteMany({ where: { workspaceId } });
    await prisma.workspace.delete({ where: { id: workspaceId } });
  }

  if (seedUser) {
    await prisma.user.delete({ where: { id: seedUser.id } });
  }
}

async function main() {
  await clearSeedData();

  const user = await prisma.user.create({
    data: {
      email: seedUserEmail,
      passwordHash: '$2b$10$EpRnT5GvIzU4GcZn4/GyPupHmYkp1FB5XbhFx1JGvBqG0KXbFmvG6',
      name: 'Daniel Alvarez',
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: seedWorkspaceName,
    },
  });

  await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'OWNER',
    },
  });

  const property = await prisma.property.create({
    data: {
      name: 'Casa Virreyes',
      street: 'Av. Virrey de Mendoza 456',
      city: 'Morelia',
      state: 'Michoacan',
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  const unit1 = await prisma.unit.create({
    data: {
      name: 'Cuarto 1',
      defaultRentCents: 350_000,
      propertyId: property.id,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  const unit2 = await prisma.unit.create({
    data: {
      name: 'Cuarto 2',
      defaultRentCents: 320_000,
      propertyId: property.id,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  const unit3 = await prisma.unit.create({
    data: {
      name: 'Departamento trasero',
      defaultRentCents: 500_000,
      propertyId: property.id,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Ana Lopez Garcia',
      phone: '4431234567',
      email: 'ana.lopez@email.com',
      city: 'Morelia',
      state: 'Michoacan',
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Carlos Hernandez Ponce',
      phone: '4439876543',
      email: 'carlos.h@email.com',
      city: 'Morelia',
      state: 'Michoacan',
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  const contract1 = await prisma.contract.create({
    data: {
      startDate: new Date('2026-01-01'),
      monthlyRentCents: 350_000,
      paymentDay: 5,
      depositAmountCents: 350_000,
      depositStatus: 'PAID',
      status: 'ACTIVE',
      tenantId: tenant1.id,
      unitId: unit1.id,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  const contract2 = await prisma.contract.create({
    data: {
      startDate: new Date('2026-03-15'),
      monthlyRentCents: 320_000,
      paymentDay: 10,
      depositAmountCents: 320_000,
      depositStatus: 'PAID',
      status: 'ACTIVE',
      tenantId: tenant2.id,
      unitId: unit2.id,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  const charge1 = await prisma.rentCharge.create({
    data: {
      dueDate: new Date('2026-06-05'),
      month: new Date('2026-06-01'),
      amountCents: 350_000,
      status: 'PARTIAL',
      contractId: contract1.id,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  const charge2 = await prisma.rentCharge.create({
    data: {
      dueDate: new Date('2026-06-10'),
      month: new Date('2026-06-01'),
      amountCents: 320_000,
      status: 'PAID',
      contractId: contract2.id,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  await prisma.payment.create({
    data: {
      amountCents: 200_000,
      paymentDate: new Date('2026-06-06'),
      method: 'BANK_TRANSFER',
      notes: 'Pago parcial, falta $1,500',
      rentChargeId: charge1.id,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  await prisma.payment.create({
    data: {
      amountCents: 320_000,
      paymentDate: new Date('2026-06-10'),
      method: 'CASH',
      notes: 'Pago completo en efectivo',
      rentChargeId: charge2.id,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  const expense1 = await prisma.expense.create({
    data: {
      amountCents: 85_000,
      category: 'REPAIR',
      date: new Date('2026-06-02'),
      description: 'Reparacion de fuga de agua',
      propertyId: property.id,
      unitId: unit2.id,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  const expense2 = await prisma.expense.create({
    data: {
      amountCents: 45_000,
      category: 'WATER',
      date: new Date('2026-06-01'),
      description: 'Recibo de agua junio',
      propertyId: property.id,
      workspaceId: workspace.id,
      createdById: user.id,
    },
  });

  console.log('Seed completed successfully.');
  console.log(`Workspace: ${workspace.id}`);
  console.log(`Property: ${property.id}`);
  console.log(`Units: ${unit1.id}, ${unit2.id}, ${unit3.id}`);
  console.log(`Tenants: ${tenant1.id}, ${tenant2.id}`);
  console.log(`Contracts: ${contract1.id}, ${contract2.id}`);
  console.log(`Charges: ${charge1.id}, ${charge2.id}`);
  console.log(`Expenses: ${expense1.id}, ${expense2.id}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
