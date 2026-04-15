const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Attempting to create user...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'sarah.johnson@gmail.com' },
    update: { password: hashedPassword },
    create: {
      email: 'sarah.johnson@gmail.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'ADMIN'
    }
  });
  console.log('User created/updated:', user.email);
}

main()
  .catch(e => console.error('CREATE ERROR:', e))
  .finally(() => prisma.$disconnect());
