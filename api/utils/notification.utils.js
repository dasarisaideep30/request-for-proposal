const prisma = require('../prismaClient');

/**
 * Notification System Utilities
 * Manages event broadcasting to stakeholders (Admins, Co-Admins, Owners)
 */

const broadcastRFPEvent = async ({ rfpId, type, title, message }) => {
  try {
    // 1. Fetch RFP to identify stakeholders
    const rfp = await prisma.rFP.findUnique({
      where: { id: rfpId },
      select: {
        proposalManagerId: true,
        solutionArchitectId: true,
        coAdminId: true
      }
    });

    if (!rfp) return;

    // 2. Identify all Admins and Co-Admins
    const priorityUsers = await prisma.user.findMany({
      where: { 
        role: { in: ['ADMIN', 'CO_ADMIN'] } 
      },
      select: { id: true }
    });

    // 3. Compile list of unique recipient IDs
    const recipients = new Set();
    
    // Add direct stakeholders
    if (rfp.proposalManagerId) recipients.add(rfp.proposalManagerId);
    if (rfp.solutionArchitectId) recipients.add(rfp.solutionArchitectId);

    // Add all master admins and co-admins
    priorityUsers.forEach(u => recipients.add(u.id));

    // 4. Bulk create notifications
    const notificationData = Array.from(recipients).map(userId => ({
      userId,
      rfpId,
      type,
      title,
      message
    }));

    if (notificationData.length > 0) {
      await prisma.notification.createMany({
        data: notificationData
      });
      console.log(`[NOTIFICATION-BROADCAST] Sent ${notificationData.length} alerts for RFP ${rfpId}`);
    }

  } catch (error) {
    console.error('[NOTIFICATION ERROR]:', error);
  }
};

module.exports = {
  broadcastRFPEvent
};
