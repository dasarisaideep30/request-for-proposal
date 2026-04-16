const { PrismaClient } = require('@prisma/client');

async function checkOtherDB() {
  const url = 'postgresql://neondb_owner:npg_vSmYDbI7gc6f@ep-royal-paper-amn47fi1-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });

  try {
    const users = await prisma.user.findMany();
    const rfps = await prisma.rFP.findMany();
    console.log(`DB ep-royal-paper: Users: ${users.length}, RFPs: ${rfps.length}`);
    if (users.length > 0) {
      console.log('Sample User:', users[0].email);
    }
  } catch (err) {
    console.error('FAILED TO CONNECT TO ep-royal-paper:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOtherDB();
