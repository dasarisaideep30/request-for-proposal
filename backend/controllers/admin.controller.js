const prisma = require('../prismaClient');

/**
 * Admin Panel - Managed by Super Admin
 * Controls user roles and Co-Admin allocations
 */

const getStats = async (req, res) => {
  try {
    const coAdminCount = await prisma.user.count({
      where: { role: 'CO_ADMIN' }
    });

    const totalUsers = await prisma.user.count();
    const totalRFPs = await prisma.rFP.count();

    res.status(200).json({
      coAdminAllocation: {
        current: coAdminCount,
        max: 12,
        isFull: coAdminCount >= 12
      },
      totalUsers,
      totalRFPs
    });
  } catch (error) {
    console.error('[ADMIN STATS ERROR]:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
};

const assignCoAdmin = async (req, res) => {
  try {
    const { userId } = req.body;

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Check allocation limit (max 12)
    const coAdminCount = await prisma.user.count({
      where: { role: 'CO_ADMIN' }
    });

    if (coAdminCount >= 12) {
      return res.status(400).json({
        error: 'Allocation Limit Reached',
        message: 'The organization has reached the maximum of 12 Co-Admin slots.'
      });
    }

    // 3. Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'CO_ADMIN' }
    });

    // 4. Log activity
    await prisma.activityLog.create({
      data: {
        action: 'STATUS_CHANGED',
        description: `User ${updatedUser.firstName} ${updatedUser.lastName} promoted to CO_ADMIN`,
        entityType: 'User',
        entityId: updatedUser.id,
        userId: req.user.id
      }
    });

    res.status(200).json({
      message: 'User successfully promoted to Co-Admin',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('[COADMIN ASSIGN ERROR]:', error);
    res.status(500).json({ error: 'Failed to assign Co-Admin role' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

module.exports = {
  getStats,
  assignCoAdmin,
  getAllUsers
};
