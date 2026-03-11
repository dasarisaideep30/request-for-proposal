/**
 * Database Seed Script
 * Populates database with realistic demo data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.task.deleteMany();
  await prisma.rFP.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // Proposal Managers
    prisma.user.create({
      data: {
        email: 'sarah.johnson@example.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'PROPOSAL_MANAGER'
      }
    }),
    prisma.user.create({
      data: {
        email: 'michael.chen@example.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'PROPOSAL_MANAGER'
      }
    }),
    
    // Solution Architects
    prisma.user.create({
      data: {
        email: 'david.kumar@example.com',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Kumar',
        role: 'SOLUTION_ARCHITECT'
      }
    }),
    prisma.user.create({
      data: {
        email: 'emily.rodriguez@example.com',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Rodriguez',
        role: 'SOLUTION_ARCHITECT'
      }
    }),
    
    // Leadership
    prisma.user.create({
      data: {
        email: 'robert.williams@example.com',
        password: hashedPassword,
        firstName: 'Robert',
        lastName: 'Williams',
        role: 'LEADERSHIP'
      }
    }),
    
    // Bid Reviewer
    prisma.user.create({
      data: {
        email: 'jennifer.taylor@example.com',
        password: hashedPassword,
        firstName: 'Jennifer',
        lastName: 'Taylor',
        role: 'BID_REVIEWER'
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  const [sarah, michael, david, emily, robert, jennifer] = users;

  // Create RFPs
  console.log('Creating RFPs...');

  const rfp1 = await prisma.rFP.create({
    data: {
      rfpNumber: 'RFP-2026-0001',
      clientName: 'Global Bank Corp',
      industry: 'Financial Services',
      projectTitle: 'Digital Banking Transformation',
      executiveSummary: 'Comprehensive digital transformation initiative for retail banking operations, including mobile app redesign, API modernization, and cloud migration.',
      submissionDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      estimatedDealValue: 2500000,
      status: 'IN_PROGRESS',
      riskLevel: 'AMBER',
      proposalManagerId: sarah.id,
      solutionArchitectId: david.id,
      completionPercentage: 45
    }
  });

  const rfp2 = await prisma.rFP.create({
    data: {
      rfpNumber: 'RFP-2026-0002',
      clientName: 'TechCorp Industries',
      industry: 'Technology',
      projectTitle: 'Enterprise Cloud Migration',
      executiveSummary: 'Migration of legacy infrastructure to AWS cloud with focus on security, scalability, and cost optimization.',
      submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      estimatedDealValue: 1800000,
      status: 'PLANNING',
      riskLevel: 'GREEN',
      proposalManagerId: michael.id,
      solutionArchitectId: emily.id,
      completionPercentage: 25
    }
  });

  const rfp3 = await prisma.rFP.create({
    data: {
      rfpNumber: 'RFP-2026-0003',
      clientName: 'HealthPlus Medical',
      industry: 'Healthcare',
      projectTitle: 'Patient Data Analytics Platform',
      executiveSummary: 'Development of HIPAA-compliant data analytics platform for patient outcomes and operational efficiency.',
      submissionDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days - HIGH RISK
      estimatedDealValue: 3200000,
      status: 'REVIEW',
      riskLevel: 'RED',
      proposalManagerId: sarah.id,
      solutionArchitectId: david.id,
      completionPercentage: 70
    }
  });

  const rfp4 = await prisma.rFP.create({
    data: {
      rfpNumber: 'RFP-2026-0004',
      clientName: 'Retail Giant Inc',
      industry: 'Retail',
      projectTitle: 'Omnichannel Customer Experience',
      executiveSummary: 'Unified customer experience platform integrating online, mobile, and in-store touchpoints.',
      submissionDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
      estimatedDealValue: 1500000,
      status: 'QUALIFICATION',
      riskLevel: 'GREEN',
      proposalManagerId: michael.id,
      completionPercentage: 15
    }
  });

  console.log('✅ Created 4 RFPs');

  // Create Milestones
  console.log('Creating milestones...');

  await prisma.milestone.createMany({
    data: [
      // RFP 1 milestones
      { type: 'KICKOFF', title: 'Project Kickoff', targetDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), isCompleted: true, completedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), rfpId: rfp1.id },
      { type: 'DRAFT_1', title: 'First Draft', targetDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), isCompleted: true, completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), rfpId: rfp1.id },
      { type: 'INTERNAL_REVIEW', title: 'Internal Review', targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), isCompleted: false, rfpId: rfp1.id },
      { type: 'FINAL_REVIEW', title: 'Final Review', targetDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), isCompleted: false, rfpId: rfp1.id },
      { type: 'SUBMISSION', title: 'Submission', targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), isCompleted: false, rfpId: rfp1.id },
      
      // RFP 3 milestones - HIGH RISK
      { type: 'KICKOFF', title: 'Project Kickoff', targetDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), isCompleted: true, completedDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), rfpId: rfp3.id },
      { type: 'DRAFT_1', title: 'First Draft', targetDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), isCompleted: true, completedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), rfpId: rfp3.id },
      { type: 'INTERNAL_REVIEW', title: 'Internal Review', targetDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), isCompleted: true, isDelayed: true, completedDate: new Date(Date.now()), rfpId: rfp3.id },
      { type: 'FINAL_REVIEW', title: 'Final Review', targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), isCompleted: false, rfpId: rfp3.id },
      { type: 'SUBMISSION', title: 'Submission', targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), isCompleted: false, rfpId: rfp3.id }
    ]
  });

  console.log('✅ Created milestones');

  // Create Tasks
  console.log('Creating tasks...');

  await prisma.task.createMany({
    data: [
      // RFP 1 tasks
      { title: 'Technical Architecture Design', description: 'Design complete system architecture with cloud services', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), status: 'IN_PROGRESS', ownerId: david.id, rfpId: rfp1.id },
      { title: 'Cost Estimation Model', description: 'Build detailed cost breakdown and ROI analysis', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'NOT_STARTED', ownerId: sarah.id, rfpId: rfp1.id },
      { title: 'Security Compliance Review', description: 'Review banking regulations and compliance requirements', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'NOT_STARTED', ownerId: david.id, rfpId: rfp1.id },
      
      // RFP 3 tasks - Some overdue for RED status
      { title: 'HIPAA Compliance Documentation', description: 'Complete HIPAA compliance requirements', dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'BLOCKED', isOverdue: true, isEscalated: false, ownerId: david.id, rfpId: rfp3.id },
      { title: 'Data Integration Strategy', description: 'Define integration with existing EMR systems', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), status: 'IN_PROGRESS', ownerId: david.id, rfpId: rfp3.id },
      { title: 'Executive Summary Finalization', description: 'Final review and polish of executive summary', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), status: 'NOT_STARTED', ownerId: sarah.id, rfpId: rfp3.id },
      
      // RFP 2 tasks
      { title: 'AWS Service Selection', description: 'Select appropriate AWS services for migration', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), status: 'COMPLETED', completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), ownerId: emily.id, rfpId: rfp2.id },
      { title: 'Migration Timeline', description: 'Create phased migration timeline with dependencies', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), status: 'IN_PROGRESS', ownerId: emily.id, rfpId: rfp2.id }
    ]
  });

  console.log('✅ Created tasks');

  // Create Activity Logs
  console.log('Creating activity logs...');

  await prisma.activityLog.createMany({
    data: [
      { action: 'RFP_CREATED', description: `RFP ${rfp1.rfpNumber} created for ${rfp1.clientName}`, entityType: 'RFP', entityId: rfp1.id, userId: sarah.id, rfpId: rfp1.id, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { action: 'TASK_ASSIGNED', description: 'Task "Technical Architecture Design" assigned to David Kumar', entityType: 'Task', entityId: '1', userId: sarah.id, rfpId: rfp1.id, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { action: 'STATUS_CHANGED', description: `RFP ${rfp1.rfpNumber} status changed to IN_PROGRESS`, entityType: 'RFP', entityId: rfp1.id, userId: sarah.id, rfpId: rfp1.id, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { action: 'RFP_CREATED', description: `RFP ${rfp3.rfpNumber} created for ${rfp3.clientName}`, entityType: 'RFP', entityId: rfp3.id, userId: sarah.id, rfpId: rfp3.id, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { action: 'RISK_ESCALATED', description: `RFP ${rfp3.rfpNumber} risk escalated to RED`, entityType: 'RFP', entityId: rfp3.id, userId: sarah.id, rfpId: rfp3.id, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
    ]
  });

  console.log('✅ Created activity logs');

  // Create Notifications
  console.log('Creating notifications...');

  await prisma.notification.createMany({
    data: [
      { type: 'TASK_ASSIGNED', title: 'New Task Assigned', message: 'Technical Architecture Design assigned to you', userId: david.id, rfpId: rfp1.id, isRead: false },
      { type: 'DEADLINE_APPROACHING', title: 'Deadline Approaching', message: `RFP ${rfp3.rfpNumber} deadline in 5 days`, userId: sarah.id, rfpId: rfp3.id, isRead: false },
      { type: 'RISK_ESCALATED', title: 'Risk Escalated', message: `RFP ${rfp3.rfpNumber} risk level is now RED`, userId: sarah.id, rfpId: rfp3.id, isRead: false },
      { type: 'TASK_ASSIGNED', title: 'New Task Assigned', message: 'Migration Timeline assigned to you', userId: emily.id, rfpId: rfp2.id, isRead: true }
    ]
  });

  console.log('✅ Created notifications');

  // Create Approvals
  console.log('Creating approvals...');

  await prisma.approval.createMany({
    data: [
      { type: 'DRAFT_APPROVAL', status: 'APPROVED', comments: 'Draft looks good, minor revisions needed', reviewerId: jennifer.id, rfpId: rfp1.id, decidedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { type: 'FINAL_APPROVAL', status: 'PENDING', reviewerId: jennifer.id, rfpId: rfp3.id }
    ]
  });

  console.log('✅ Created approvals');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Demo User Credentials:');
  console.log('   Email: sarah.johnson@example.com');
  console.log('   Password: password123');
  console.log('   Role: Proposal Manager\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
