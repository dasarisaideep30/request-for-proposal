/**
 * RFP Command Center - Master Demo Seed
 * Provisions exactly 11 users according to the official Demo Script
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Master Demo Provisioning...');

  const masterPassword = await bcrypt.hash('Demo123!', 10);
  const gmailPassword = await bcrypt.hash('password123', 10);

  console.log('Cleaning environment...');
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.task.deleteMany();
  await prisma.rFP.deleteMany();
  await prisma.user.deleteMany();

  console.log('Provisioning 11 Enterprise Accounts...');

  // 1. Core Master Admin (Sarah Johnson)
  await prisma.user.create({
    data: {
      email: 'sarah.johnson@gmail.com',
      firstName: 'Sarah',
      lastName: 'Johnson (Gmail)',
      role: 'ADMIN',
      password: gmailPassword
    }
  });

  // 2. Demo Version of Sarah Johnson (ADMIN)
  await prisma.user.create({
    data: {
      email: 'sarah.johnson@rfp.test',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'ADMIN',
      password: masterPassword
    }
  });

  // 3. User Register (Michael, Elena, David, Anita) - Targets for Co-Admin
  const coAdminTargets = [
    { email: 'michael@gmail.com', firstName: 'Michael', lastName: 'Scott', role: 'PROPOSAL_MANAGER' },
    { email: 'jim@gmail.com', firstName: 'Jim', lastName: 'Halpert', role: 'CO_ADMIN' },
    { email: 'dwight@gmail.com', firstName: 'Dwight', lastName: 'Schrute', role: 'SOLUTION_ARCHITECT' },
    { email: 'michael.c@rfp.test', firstName: 'Michael', lastName: 'Chang', role: 'PROPOSAL_MANAGER' },
    { email: 'elena.r@rfp.test', firstName: 'Elena', lastName: 'Rodriguez', role: 'PROPOSAL_MANAGER' },
  ];

  for (const u of coAdminTargets) {
    await prisma.user.create({
      data: { ...u, password: gmailPassword }
    });
  }

  // 4. RFP Creators (Marcus, Sarah Lee, James, etc.)
  const creators = [
    { email: 'marcus.w@rfp.test', firstName: 'Marcus', lastName: 'Wright' },
    { email: 'sarah.l@rfp.test', firstName: 'Sarah', lastName: 'Lee' },
    { email: 'james.w@rfp.test', firstName: 'James', lastName: 'Wilson' },
    { email: 'olivia.b@rfp.test', firstName: 'Olivia', lastName: 'Brown' },
    { email: 'william.t@rfp.test', firstName: 'William', lastName: 'Taylor' },
    { email: 'sophia.d@rfp.test', firstName: 'Sophia', lastName: 'Davis' },
  ];

  for (const u of creators) {
    await prisma.user.create({
      data: { ...u, role: 'PROPOSAL_MANAGER', password: masterPassword }
    });
  }

  console.log(`✅ Provisioned 11 users successfully.`);
}

main()
  .catch((e) => {
    console.error('❌ Provisioning failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
