const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// CONTEXT: Super Senior QA Analyst Final Deployment Sync
// PURPOSE: Create the 'Ultimate Showcase' environment for immediate presentation.

const ADMIN_ID = '3e9c0674-642a-48e7-89bd-37f11994f095';
const JAMES_ID = '06124148-5ff4-486e-9f91-5389f79841f8';
const JIM_ID = 'fd429492-66eb-49ff-b488-2c6be0ad00a2';

async function setupShowcase() {
  console.log('--- RFP COMMAND CENTER: FINAL QA SUCCESS SYNC ---');

  try {
    console.log('[1/5] Purging old states...');
    await prisma.notification.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.task.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.rFP.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('[2/5] Creating Elite User Base...');
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
          lastName: 'Halper',
          role: 'CO_ADMIN',
          isActive: true
        }
      ]
    });

    console.log('[3/5] Deploying Showcase RFPs...');
    
    // RFP 1: High Confidence, Active Status (Owned by James)
    const rfp1 = await prisma.rFP.create({
      data: {
        rfpNumber: 'RFP-2026-X01',
        clientName: 'Global Equities Bank (GEB)',
        industry: 'Financial Services',
        projectTitle: 'Project Horizon: Hybrid Cloud Resiliency Framework',
        executiveSummary: 'High-security multi-cloud transformation for tier-1 investment bank.',
        submissionDeadline: new Date(Date.now() + 86400000 * 20),
        estimatedDealValue: 15000000,
        status: 'IN_PROGRESS',
        riskLevel: 'GREEN',
        proposalManagerId: JAMES_ID,
        coAdminId: JIM_ID, // Jim is overseeing this
        complianceRemarks: 'DORA and SOC2 compliance paths verified.',
        technicalRemarks: 'Kubernetes multi-region failover architecture proposed.',
        tasks: {
          create: [
            { title: 'Finalize Pricing Model', description: 'Confirm with Finance', status: 'IN_PROGRESS', ownerId: JAMES_ID },
            { title: 'Security Certification', description: 'Internal ISO review', status: 'COMPLETED', ownerId: JIM_ID }
          ]
        }
      }
    });

    // RFP 2: Emerging Opportunity, Needs Recheck (Owned by Jim)
    const rfp2 = await prisma.rFP.create({
      data: {
        rfpNumber: 'RFP-2026-N99',
        clientName: 'NorthStar Health Alliance',
        industry: 'Healthcare',
        projectTitle: 'NorthStar One: Interoperability Core',
        executiveSummary: 'Statewide FHIR interoperability platform for patient data.',
        submissionDeadline: new Date(Date.now() + 86400000 * 5),
        estimatedDealValue: 8500000,
        status: 'INTAKE',
        riskLevel: 'YELLOW', // To showcase risk visual
        proposalManagerId: JIM_ID,
        technicalRemarks: 'Healthcare SME required for FHIR mapping.',
        tasks: {
          create: [
            { title: 'Recruit FHIR Specialist', description: 'ASAP for Technical Bid', status: 'IN_PROGRESS', ownerId: JIM_ID }
          ]
        }
      }
    });

    console.log('[4/5] Injecting Live Notification Stream...');
    await prisma.notification.createMany({
      data: [
        { userId: ADMIN_ID, type: 'TASK_ASSIGNED', title: 'New RFP Created', message: 'Project Horizon has been initialized by James.', isRead: false },
        { userId: JAMES_ID, type: 'TASK_ASSIGNED', title: 'Jim Joined as Co-Admin', message: 'Jim Halper is now overseeing Project Horizon.', isRead: false }
      ]
    });

    console.log('[5/5] Logging Audit-Ready Activity...');
    await prisma.activityLog.createMany({
      data: [
        { action: 'RFP_CREATED', description: 'Sarah Johnson authorized Project Horizon kickoff.', entityType: 'RFP', entityId: rfp1.id, userId: ADMIN_ID },
        { action: 'STATUS_CHANGED', description: 'NorthStar Health risk level escalated to YELLOW.', entityType: 'RFP', entityId: rfp2.id, userId: JIM_ID }
      ]
    });

    console.log('--- SYSTEM READY: SHOWCASE FLIGHT CHECK COMPLETED ---');
  } catch (error) {
    console.error('QA CRITICAL FAILURE:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupShowcase();
