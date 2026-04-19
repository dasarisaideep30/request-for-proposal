const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['michael@gmail.com', 'jim@gmail.com', 'dwight@gmail.com']
      }
    }
  });
  console.log('Successfully cleared demo accounts for manual registration.');
}

main().finally(() => prisma.$disconnect());
