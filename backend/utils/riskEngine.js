/**
 * Risk Calculation Engine
 * Auto-calculates RFP risk level based on multiple factors
 */

/**
 * Calculate risk level for an RFP
 * @param {Object} rfp - RFP object with tasks and milestones
 * @returns {String} - 'GREEN', 'AMBER', or 'RED'
 */
function calculateRiskLevel(rfp, tasks = [], milestones = []) {
  let riskScore = 0;

  // Factor 1: Deadline proximity (0-30 points)
  const daysUntilDeadline = Math.floor(
    (new Date(rfp.submissionDeadline) - new Date()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilDeadline < 0) {
    riskScore += 30; // Deadline passed
  } else if (daysUntilDeadline <= 3) {
    riskScore += 25;
  } else if (daysUntilDeadline <= 7) {
    riskScore += 15;
  } else if (daysUntilDeadline <= 14) {
    riskScore += 5;
  }

  // Factor 2: Incomplete tasks percentage (0-30 points)
  if (tasks.length > 0) {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const incompletePct = ((tasks.length - completedTasks) / tasks.length) * 100;
    
    if (incompletePct > 75) {
      riskScore += 30;
    } else if (incompletePct > 50) {
      riskScore += 20;
    } else if (incompletePct > 25) {
      riskScore += 10;
    }
  }

  // Factor 3: Overdue milestones (0-25 points)
  const now = new Date();
  const overdueMilestones = milestones.filter(m => 
    !m.isCompleted && new Date(m.targetDate) < now
  );
  
  if (overdueMilestones.length > 0) {
    riskScore += Math.min(25, overdueMilestones.length * 10);
  }

  // Factor 4: No assigned solution architect (15 points)
  if (!rfp.solutionArchitectId) {
    riskScore += 15;
  }

  // Determine risk level based on total score
  if (riskScore >= 50) {
    return 'RED';
  } else if (riskScore >= 25) {
    return 'AMBER';
  } else {
    return 'GREEN';
  }
}

/**
 * Calculate completion percentage for an RFP
 * @param {Array} tasks - Array of tasks
 * @param {Array} milestones - Array of milestones
 * @returns {Number} - Percentage (0-100)
 */
function calculateCompletionPercentage(tasks = [], milestones = []) {
  let totalWeight = 0;
  let completedWeight = 0;

  // Tasks contribute 70% of completion
  if (tasks.length > 0) {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    totalWeight += 70;
    completedWeight += (completedTasks / tasks.length) * 70;
  }

  // Milestones contribute 30% of completion
  if (milestones.length > 0) {
    const completedMilestones = milestones.filter(m => m.isCompleted).length;
    totalWeight += 30;
    completedWeight += (completedMilestones / milestones.length) * 30;
  }

  return totalWeight > 0 ? Math.round(completedWeight) : 0;
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
  
  // Escalate if overdue by more than 48 hours
  const hoursOverdue = (now - dueDate) / (1000 * 60 * 60);
  const isEscalated = isOverdue && hoursOverdue > 48;

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
