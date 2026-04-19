const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runQA() {
  console.log('--- RFP Command Center QA Audit (Meta Senior QA Standard) ---');

  // 1. Check Identities
  const users = await prisma.user.findMany();
  const sarah = users.find(u => u.email === 'sarah.johnson@gmail.com');
  const james = users.find(u => u.email === 'james@gmail.com');
  const jim = users.find(u => u.email === 'jim@gmail.com');

  console.log(`[ID CHECK] Sarah: ${sarah ? sarah.role : 'NOT FOUND'}`);
  console.log(`[ID CHECK] James: ${james ? james.role : 'NOT FOUND'}`);
  console.log(`[ID CHECK] Jim: ${jim ? jim.role : 'NOT FOUND'}`);

  if (!sarah || !james || !jim) throw new Error('Identity verification failed.');

  // 2. Check Governance Alignment
  const rfp1 = await prisma.rFP.findUnique({
    where: { rfpNumber: 'RFP-2026-0001' },
    include: { proposalManager: true, coAdmin: true }
  });

  const rfp2 = await prisma.rFP.findUnique({
    where: { rfpNumber: 'RFP-2026-0002' },
    include: { proposalManager: true, coAdmin: true }
  });

  console.log(`[RFP-1 AUDIT] Title: ${rfp1.projectTitle}`);
  console.log(`[RFP-1 AUDIT] Manager: ${rfp1.proposalManager.email}`);
  console.log(`[RFP-1 AUDIT] Co-Admin (Oversight): ${rfp1.coAdmin?.email || 'NONE'}`);

  console.log(`[RFP-2 AUDIT] Title: ${rfp2.projectTitle}`);
  console.log(`[RFP-2 AUDIT] Manager: ${rfp2.proposalManager.email}`);
  console.log(`[RFP-2 AUDIT] Co-Admin: ${rfp2.coAdmin?.email || 'NONE'}`);

  // 3. Simulated Privacy Filter Check (the exact code running in the backend)
  const jamesVisibility = await prisma.rFP.count({
    where: {
      OR: [
        { proposalManagerId: james.id },
        { coAdminId: james.id },
        { solutionArchitectId: james.id }
      ]
    }
  });

  const jimVisibility = await prisma.rFP.count({
    where: {
      OR: [
        { proposalManagerId: jim.id },
        { coAdminId: jim.id },
        { solutionArchitectId: jim.id }
      ]
    }
  });

  const sarahVisibility = await prisma.rFP.count({}); // Admin sees all

  console.log(`[VISIBILITY] James Count: ${jamesVisibility} (Target: 2)`);
  console.log(`[VISIBILITY] Jim Count: ${jimVisibility} (Target: 1)`);
  console.log(`[VISIBILITY] Sarah Count: ${sarahVisibility} (Target: 2)`);

  if (jamesVisibility === 2 && jimVisibility === 1 && sarahVisibility === 2) {
    console.log('--- QA PASSED: DATA ISOLATION & GOVERNANCE COMPLIANT ---');
  } else {
    console.error('--- QA FAILED: ACCESS LEAK DETECTED ---');
  }

  await prisma.$disconnect();
}

runQA();
