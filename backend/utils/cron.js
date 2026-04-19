/**
 * Task Automation Cron
 * Automatically flags overdue tasks and handles escalations.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = require('../prismaClient');
const { checkTaskOverdue, calculateRiskLevel, calculateCompletionPercentage } = require('./riskEngine');

async function runOverdueCheck() {
    console.log('[CRON] Starting overdue task check...');
    try {
        const tasks = await prisma.task.findMany({
            where: {
                status: { not: 'COMPLETED' },
            },
            include: { rfp: true }
        });

        for (const task of tasks) {
            const { isOverdue, isEscalated } = checkTaskOverdue(task);

            // If status changed, update the task
            if (task.isOverdue !== isOverdue || task.isEscalated !== isEscalated) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: { isOverdue, isEscalated }
                });

                // Trigger notifications & logs if it just escalated
                if (isEscalated && !task.isEscalated) {
                    // Log Activity
                    await prisma.activityLog.create({
                        data: {
                            action: 'RISK_ESCALATED',
                            description: `Task "${task.title}" has been escalated (>48hrs overdue)`,
                            entityType: 'Task',
                            entityId: task.id,
                            userId: task.ownerId, // System action, but assigned to owner reference
                            rfpId: task.rfpId
                        }
                    });

                    // Notify Owner
                    await prisma.notification.create({
                        data: {
                            type: 'RISK_ESCALATED',
                            title: 'Task Escalated',
                            message: `Your task "${task.title}" is severely overdue and has been escalated.`,
                            userId: task.ownerId,
                            rfpId: task.rfpId
                        }
                    });

                    // Notify Manager
                    await prisma.notification.create({
                        data: {
                            type: 'RISK_ESCALATED',
                            title: 'Task Escalated',
                            message: `A task in your RFP "${task.title}" has been escalated.`,
                            userId: task.rfp.proposalManagerId,
                            rfpId: task.rfpId
                        }
                    });

                    // Recalculate RFP metrics
                    const rfp = await prisma.rFP.findUnique({
                        where: { id: task.rfpId },
                        include: { tasks: true, milestones: true }
                    });
                    const riskLevel = calculateRiskLevel(rfp, rfp.tasks, rfp.milestones);
                    const completionPct = calculateCompletionPercentage(rfp.tasks, rfp.milestones);

                    await prisma.rFP.update({
                        where: { id: task.rfpId },
                        data: { riskLevel, completionPercentage: completionPct }
                    });
                }
            }
        }
        console.log('[CRON] Overdue task check completed.');
    } catch (error) {
        console.error('[CRON] Error during overdue task check:', error);
    }
}

// Start the cron internally (every hour in production, every minute for demo)
function startCron() {
    // Run immediately on start
    runOverdueCheck();

    // Set interval (every 1 hour = 3600000 ms)
    setInterval(runOverdueCheck, 3600000);
}

module.exports = { startCron, runOverdueCheck };
