/**
 * Risk Calculation Engine
 * Auto-calculates RFP risk level based on multiple factors
 */

/**
 * Calculate risk level for an RFP
 * @param {Object} rfp - RFP object
 * @returns {String} - 'GREEN', 'AMBER', or 'RED'
 */
function calculateRiskLevel(rfp) {
  const deadline = new Date(rfp.submissionDeadline);
  const today = new Date();
  
  // Normalize dates to start of day for accurate comparison
  const d1 = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const daysUntilDeadline = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
  const rfpValue = Number(rfp.estimatedDealValue) || 0;

  // Rule 1: High Value Factor (> $5M) - High value deals are automatically elevated if nearing deadline
  // Rule 2: Aging Factor (1-5 RED, 5-15 AMBER, >15 GREEN)
  
  if (daysUntilDeadline <= 5) {
    return 'RED';
  }
  
  // If value is very high (>5M), we move Amber threshold to 20 days instead of 15
  const amberThreshold = rfpValue > 5000000 ? 20 : 15;
  
  if (daysUntilDeadline <= amberThreshold) {
    return 'AMBER';
  }

  return 'GREEN';
}

/**
 * Calculate completion percentage for an RFP
 * @param {Array} tasks - Array of tasks
 * @param {Array} milestones - Array of milestones
 * @returns {Number} - Percentage (0-100)
 */
function calculateCompletionPercentage(tasks = [], milestones = []) {
  if (tasks.length === 0 && milestones.length === 0) return 0;

  const totalItems = tasks.length + milestones.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const completedMilestones = milestones.filter(m => m.isCompleted).length;
  
  const totalCompleted = completedTasks + completedMilestones;
  
  return Math.round((totalCompleted / totalItems) * 100);
}

/**
 * Check if task is overdue and needs escalation
 * @param {Object} task - Task object
 * @returns {Object} - { isOverdue, isEscalated }
 */
function checkTaskOverdue(task) {
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const isOverdue = now > dueDate && task.status !== 'COMPLETED';
  
  // Escalate if overdue by more than 24 hours
  const hoursOverdue = (now - dueDate) / (1000 * 60 * 60);
  const isEscalated = isOverdue && hoursOverdue > 24;

  return { isOverdue, isEscalated };
}

/**
 * Generate auto-milestones based on submission deadline
 * @param {Date} submissionDeadline - RFP submission deadline
 * @returns {Array} - Array of milestone objects
 */
function generateMilestones(submissionDeadline) {
  const deadline = new Date(submissionDeadline);
  const now = new Date();
  const totalDays = Math.floor((deadline - now) / (1000 * 60 * 60 * 24));

  // Calculate milestone dates working backwards from deadline
  const milestones = [
    {
      type: 'SUBMISSION',
      title: 'Final Submission',
      targetDate: new Date(deadline)
    },
    {
      type: 'FINAL_REVIEW',
      title: 'Final Review & Approval',
      targetDate: new Date(deadline.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days before
    },
    {
      type: 'INTERNAL_REVIEW',
      title: 'Internal Review',
      targetDate: new Date(deadline.getTime() - 7 * 24 * 60 * 60 * 1000) // 1 week before
    },
    {
      type: 'DRAFT_1',
      title: 'First Draft Complete',
      targetDate: new Date(deadline.getTime() - Math.floor(totalDays * 0.6) * 24 * 60 * 60 * 1000)
    },
    {
      type: 'KICKOFF',
      title: 'Project Kickoff',
      targetDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000) // Tomorrow
    }
  ];

  return milestones.reverse(); // Order chronologically
}

module.exports = {
  calculateRiskLevel,
  calculateCompletionPercentage,
  checkTaskOverdue,
  generateMilestones
};
