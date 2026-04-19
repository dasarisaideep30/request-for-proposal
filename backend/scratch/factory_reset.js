const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initiating Total System Reset...');

  // 1. Delete all transactional data
  console.log('Cleaning transactional data...');
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.task.deleteMany();
  await prisma.rFP.deleteMany();

  // 2. Clear all users except Sarah
  console.log('Cleaning user accounts...');
  await prisma.user.deleteMany({
    where: {
      email: { not: 'sarah.johnson@gmail.com' }
    }
  });

  // 3. Ensure Sarah exists and has the correct password
  console.log('Resetting Admin credentials...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'sarah.johnson@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Sarah',
      lastName: 'Johnson',
      isActive: true
    },
    create: {
      email: 'sarah.johnson@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Sarah',
      lastName: 'Johnson',
      isActive: true
    }
  });

  console.log('✅ FACTORY RESET COMPLETE.');
  console.log('Admin: sarah.johnson@gmail.com');
  console.log('Password: password123');
}

main()
  .catch(e => console.error('❌ Reset failed:', e))
  .finally(() => prisma.$disconnect());
