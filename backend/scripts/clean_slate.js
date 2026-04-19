const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// CONTEXT: Billion-Dollar Project Clean Slate
// GOAL: Purge all telemetry and transactional data, leave ONLY the Super Admin.

const ADMIN_ID = '3e9c0674-642a-48e7-89bd-37f11994f095';

async function purgeAll() {
  console.log('--- RFP COMMAND CENTER: TOTAL SYSTEM PURGE ---');
  
  try {
    // 1. Transactional Data
    console.log('[1/5] Wiping Notifications, Logs, and Approvals...');
    await prisma.notification.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.approval.deleteMany();
    
    // 2. Task Management
    console.log('[2/5] Wiping Tasks and Milestones...');
    await prisma.task.deleteMany();
    await prisma.milestone.deleteMany();
    
    // 3. Project Data
    console.log('[3/5] Wiping RFPs...');
    await prisma.rFP.deleteMany();
    
    // 4. Identity Management
    console.log('[4/5] Purging all users except Master Admin...');
    await prisma.user.deleteMany({
      where: {
        id: { not: ADMIN_ID }
      }
    });

    // 5. Ensure Master Admin exists
    const adminExists = await prisma.user.findUnique({
      where: { id: ADMIN_ID }
    });

    if (!adminExists) {
        console.log('[5/5] Re-provisioning Master Admin (Sarah)...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        await prisma.user.create({
            data: {
                id: ADMIN_ID,
                email: 'sarah.johnson@gmail.com',
                password: hashedPassword,
                firstName: 'Sarah',
                lastName: 'Johnson',
                role: 'ADMIN',
                isActive: true
            }
        });
    } else {
        console.log('[5/5] Master Admin verified.');
    }

    console.log('--- SYSTEM PURGE COMPLETE: READY FOR FRESH OPS ---');
  } catch (error) {
    console.error('SYSTEM PURGE CRITICAL FAILURE:', error);
  } finally {
    await prisma.$disconnect();
  }
}

purgeAll();
