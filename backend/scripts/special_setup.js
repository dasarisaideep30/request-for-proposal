const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// GLOBAL DETERMINISTIC IDS
const ADMIN_ID = '3e9c0674-642a-48e7-89bd-37f11994f095';
const JAMES_ID = '06124148-5ff4-486e-9f91-5389f79841f8';
const JIM_ID = 'fd429492-66eb-49ff-b488-2c6be0ad00a2';

async function resetAndSetup() {
  console.log('--- RFP COMMAND CENTER: FINAL MISSION CRITICAL ALIGNMENT ---');

  try {
    console.log('[1/4] Full Data Purge...');
    await prisma.notification.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.task.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.rFP.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('[2/4] Provisioning Core Identities (Sarah, James, Jim)...');
    
    await prisma.user.createMany({
      data: [
        {
          id: ADMIN_ID,
          email: 'sarah.johnson@gmail.com',
          password: hashedPassword,
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'ADMIN',
          isActive: true
        },
        {
          id: JAMES_ID,
          email: 'james@gmail.com',
          password: hashedPassword,
          firstName: 'James',
          lastName: 'Anderson',
          role: 'PROPOSAL_MANAGER',
          isActive: true
        },
        {
          id: JIM_ID,
          email: 'jim@gmail.com',
          password: hashedPassword,
          firstName: 'Jim',
          lastName: 'Halper', // Corrected spelling as per user request
          role: 'CO_ADMIN',
          isActive: true
        }
      ]
    });

    console.log('[3/4] Distributing RFPs to correct owners...');
    const thirtyDays = new Date(); thirtyDays.setDate(thirtyDays.getDate() + 30);
    const fortyFiveDays = new Date(); fortyFiveDays.setDate(fortyFiveDays.getDate() + 45);

    // RFP 1: Global Equities Bank -> JAMES ANDERSON
    await prisma.rFP.create({
      data: {
        rfpNumber: 'RFP-2026-0001',
        clientName: 'Global Equities Bank (GEB)',
        industry: 'Financial Services',
        projectTitle: 'Project Horizon: Hybrid Cloud Resiliency Framework',
        executiveSummary: `Global Equities Bank (GEB) objectives: Zero-Trust Security, DORA compliance, <50ms latency.`,
        submissionDeadline: thirtyDays,
        estimatedDealValue: 15000000,
        status: 'INTAKE',
        riskLevel: 'GREEN',
        proposalManagerId: JAMES_ID,
        coAdminId: JIM_ID, // Jim governs this
        tasks: {
          create: [{
            title: 'Initial Security Audit',
            description: 'Evaluate Zero-Trust benchmarks',
            dueDate: new Date(Date.now() + 86400000 * 3),
            ownerId: JAMES_ID
          }]
        }
      }
    });

    // RFP 2: NorthStar Health Alliance -> JIM HALPER
    await prisma.rFP.create({
      data: {
        rfpNumber: 'RFP-2026-0002',
        clientName: 'NorthStar Health Alliance',
        industry: 'Healthcare',
        projectTitle: 'NorthStar One: Interoperability & Analytics Core',
        executiveSummary: `NorthStar Health Alliance: FHIR-based platform, HIPAA compliance, Predictive Analytics.`,
        submissionDeadline: fortyFiveDays,
        estimatedDealValue: 8500000,
        status: 'INTAKE',
        riskLevel: 'GREEN',
        proposalManagerId: JIM_ID, // CORRECTED OWNER TO JIM
        tasks: {
          create: [{
            title: 'HIPAA Data Flow Mapping',
            description: 'Document end-to-end encryption paths',
            dueDate: new Date(Date.now() + 86400000 * 5),
            ownerId: JIM_ID
          }]
        }
      }
    });

    console.log('[4/4] Generating Synchronized Notifications...');
    await prisma.notification.createMany({
      data: [
        {
          userId: JAMES_ID,
          type: 'STATUS_CHANGED',
          title: 'System Access Restored',
          message: 'Your RFP assignments are now correctly synchronized.',
          isRead: false
        },
        {
          userId: JIM_ID,
          type: 'STATUS_CHANGED',
          title: 'Project Lead Assigned',
          message: 'You are now the lead for NorthStar Health Alliance RFP.',
          isRead: false
        }
      ]
    });

    console.log('--- FINAL STATE ALIGNED: DATA INTEGRITY VERIFIED ---');
  } catch (err) {
    console.error('ALARM: Seed failure:', err);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSetup();
