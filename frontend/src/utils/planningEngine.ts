/* ═══════════════════════════════════════════════════════════════
   RAILSYNC AI — Utility Functions
   Block planning algorithms, risk scoring, conflict detection
   ═══════════════════════════════════════════════════════════════
   NOTE: These are prototype simulation algorithms.
   They do NOT use Google OR-Tools or any trained ML model.
   ═══════════════════════════════════════════════════════════════ */

import type { MaintenanceTask, BlockWindow, TrainMovement, Priority } from '../data/railwayData';

// ─── Time Utilities ──────────────────────────────────────────

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── Train Conflict Detection ────────────────────────────────

export function checkTrainConflicts(
  block: BlockWindow,
  trains: TrainMovement[]
): TrainMovement[] {
  const blockStart = timeToMinutes(block.startTime);
  const blockEnd = timeToMinutes(block.endTime);

  return trains.filter(train => {
    if (train.section !== block.sectionId) return false;
    const trainTime = timeToMinutes(train.time);
    return trainTime >= blockStart && trainTime <= blockEnd;
  });
}

export function hasTrainConflict(
  block: BlockWindow,
  trains: TrainMovement[]
): boolean {
  return checkTrainConflicts(block, trains).length > 0;
}

// ─── Risk / Priority Scoring ─────────────────────────────────

export function calculateRiskScore(task: MaintenanceTask): {
  score: number;
  level: Priority;
  reason: string;
} {
  let score = task.risk;

  // Factor in deadline proximity
  const today = new Date();
  const deadline = new Date(task.deadline);
  const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (task.deadline === 'IMMEDIATE') {
    score = Math.min(100, score + 20);
  } else if (daysUntilDeadline < 0) {
    score = Math.min(100, score + 15); // overdue
  } else if (daysUntilDeadline <= 2) {
    score = Math.min(100, score + 10);
  } else if (daysUntilDeadline <= 5) {
    score = Math.min(100, score + 5);
  }

  // Safety impact boost
  if (task.safetyImpact === 'CRITICAL') score = Math.min(100, score + 10);
  else if (task.safetyImpact === 'HIGH') score = Math.min(100, score + 5);

  // Priority label boost
  if (task.priority === 'CRITICAL') score = Math.min(100, score + 5);

  let level: Priority;
  if (score >= 90) level = 'CRITICAL';
  else if (score >= 70) level = 'HIGH';
  else if (score >= 40) level = 'MEDIUM';
  else level = 'LOW';

  // Generate reason
  const reasons: string[] = [];
  if (task.risk >= 80) reasons.push(`base risk ${task.risk}/100`);
  if (task.deadline === 'IMMEDIATE') reasons.push('immediate deadline');
  else if (daysUntilDeadline < 0) reasons.push(`${Math.abs(daysUntilDeadline)} days overdue`);
  else if (daysUntilDeadline <= 3) reasons.push(`deadline in ${daysUntilDeadline} day(s)`);
  if (task.safetyImpact === 'CRITICAL' || task.safetyImpact === 'HIGH') {
    reasons.push(`${task.safetyImpact.toLowerCase()} safety impact`);
  }
  if (reasons.length === 0) reasons.push(`risk score ${task.risk}/100`);

  return {
    score,
    level,
    reason: `${level} priority — ${reasons.join(', ')}.`
  };
}

// ─── Task Compatibility ──────────────────────────────────────

export function findCompatibleTasks(
  tasks: MaintenanceTask[],
  block: BlockWindow
): MaintenanceTask[] {
  // Tasks in same section that are still pending
  const sectionTasks = tasks.filter(
    t => t.section === block.sectionId && t.status === 'PENDING'
  );

  // Sort by priority score (highest first)
  sectionTasks.sort((a, b) => {
    const scoreA = calculateRiskScore(a).score;
    const scoreB = calculateRiskScore(b).score;
    return scoreB - scoreA;
  });

  // Greedy packing: fit as many as possible
  const compatible: MaintenanceTask[] = [];
  let remainingTime = block.duration;

  for (const task of sectionTasks) {
    if (task.duration <= remainingTime) {
      compatible.push(task);
      remainingTime -= task.duration;
    }
  }

  return compatible;
}

// ─── Block Utilization ───────────────────────────────────────

export function calculateBlockUtilization(
  block: BlockWindow,
  tasks: MaintenanceTask[]
): number {
  const bundledTasks = tasks.filter(t => block.bundledTasks.includes(t.id));
  const totalUsed = bundledTasks.reduce((sum, t) => sum + t.duration, 0);
  return block.duration > 0 ? Math.round((totalUsed / block.duration) * 100) : 0;
}

// ─── Optimization Engine (Constraint Simulation) ─────────────

export interface OptimizedPlan {
  blocks: BlockWindow[];
  taskAssignments: Record<string, string[]>; // blockId -> taskIds
  conflicts: Array<{ blockId: string; trains: TrainMovement[] }>;
  metrics: {
    totalBlocks: number;
    totalTasks: number;
    avgUtilization: number;
    conflictsDetected: number;
    conflictsAvoided: number;
    crossDeptBundles: number;
    criticalTasksCovered: number;
    totalDowntimeMinutes: number;
  };
}

export function optimizeBlocks(
  tasks: MaintenanceTask[],
  blocks: BlockWindow[],
  trains: TrainMovement[],
  selectedTaskIds: string[]
): OptimizedPlan {
  const selectedTasks = tasks.filter(t => selectedTaskIds.includes(t.id) && t.status === 'PENDING');
  
  // Group tasks by section
  const grouped: Record<string, MaintenanceTask[]> = {};
  for (const task of selectedTasks) {
    if (!grouped[task.section]) grouped[task.section] = [];
    grouped[task.section].push(task);
  }

  // Sort tasks in each group by risk (highest first)
  for (const section of Object.keys(grouped)) {
    grouped[section].sort((a, b) => calculateRiskScore(b).score - calculateRiskScore(a).score);
  }

  const newBlocks = blocks.map(b => ({
    ...b,
    bundledTasks: [...b.bundledTasks],
    trainConflicts: [...b.trainConflicts],
  }));

  const taskAssignments: Record<string, string[]> = {};
  const allConflicts: Array<{ blockId: string; trains: TrainMovement[] }> = [];
  let conflictsAvoided = 0;
  let crossDeptBundles = 0;
  let criticalTasksCovered = 0;
  const assignedTaskIds = new Set<string>();

  for (const [section, sectionTasks] of Object.entries(grouped)) {
    // Find all available blocks for this section
    const availableBlocks = newBlocks.filter(
      b => b.sectionId === section && b.status === 'AVAILABLE'
    );

    for (const block of availableBlocks) {
      // Check train conflicts
      const conflicts = checkTrainConflicts(block, trains);
      if (conflicts.length > 0) {
        allConflicts.push({ blockId: block.id, trains: conflicts });
        block.trainConflicts = conflicts.map(t => `${t.trainNumber} at ${t.time}`);
        conflictsAvoided++;
        continue; // Skip blocks with conflicts
      }

      // Greedy bin-packing
      let remainingCapacity = block.duration;
      const assigned: string[] = [];
      const departments = new Set<string>();

      for (const task of sectionTasks) {
        if (assignedTaskIds.has(task.id)) continue;
        if (task.duration <= remainingCapacity) {
          assigned.push(task.id);
          assignedTaskIds.add(task.id);
          remainingCapacity -= task.duration;
          departments.add(task.department);
          if (task.priority === 'CRITICAL') criticalTasksCovered++;
        }
      }

      if (assigned.length > 0) {
        block.status = 'SCHEDULED';
        block.bundledTasks = assigned;
        const totalUsed = block.duration - remainingCapacity;
        block.utilization = Math.round((totalUsed / block.duration) * 100);
        taskAssignments[block.id] = assigned;

        if (departments.size >= 2) crossDeptBundles++;
      }
    }
  }

  // Calculate metrics
  const scheduledBlocks = newBlocks.filter(b => b.status === 'SCHEDULED');
  const avgUtil = scheduledBlocks.length > 0
    ? Math.round(scheduledBlocks.reduce((s, b) => s + b.utilization, 0) / scheduledBlocks.length)
    : 0;
  const totalDowntime = scheduledBlocks.reduce((s, b) => s + b.duration, 0);

  return {
    blocks: newBlocks,
    taskAssignments,
    conflicts: allConflicts,
    metrics: {
      totalBlocks: scheduledBlocks.length,
      totalTasks: assignedTaskIds.size,
      avgUtilization: avgUtil,
      conflictsDetected: allConflicts.length,
      conflictsAvoided,
      crossDeptBundles,
      criticalTasksCovered,
      totalDowntimeMinutes: totalDowntime,
    }
  };
}

// ─── Dashboard Metrics ───────────────────────────────────────

export function calculateDashboardMetrics(
  tasks: MaintenanceTask[],
  blocks: BlockWindow[],
  trains: TrainMovement[]
) {
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
  const plannedTasks = tasks.filter(t => t.status === 'PLANNED').length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const scheduledBlocks = blocks.filter(b => b.status === 'SCHEDULED' || b.status === 'APPROVED').length;
  const availableBlocks = blocks.filter(b => b.status === 'AVAILABLE').length;

  // Calculate average utilization of scheduled blocks
  const scheduledBlocksList = blocks.filter(b => b.status === 'SCHEDULED' || b.status === 'APPROVED');
  const avgUtilization = scheduledBlocksList.length > 0
    ? Math.round(scheduledBlocksList.reduce((s, b) => s + b.utilization, 0) / scheduledBlocksList.length)
    : 0;

  // Count cross-dept bundles
  const crossDeptBundles = scheduledBlocksList.filter(b => {
    const bundledTasks = tasks.filter(t => b.bundledTasks.includes(t.id));
    const departments = new Set(bundledTasks.map(t => t.department));
    return departments.size >= 2;
  }).length;

  // Count conflicts detected
  const totalConflicts = blocks.reduce((sum, block) => {
    return sum + checkTrainConflicts(block, trains).length;
  }, 0);

  // Critical tasks
  const criticalTasks = tasks.filter(t => t.priority === 'CRITICAL');
  const criticalCovered = criticalTasks.filter(t => t.status === 'PLANNED' || t.status === 'COMPLETED').length;

  // Asset availability: (total block time - used block time) / total block time
  const totalBlockTime = blocks.reduce((s, b) => s + b.duration, 0);
  const usedBlockTime = scheduledBlocksList.reduce((s, b) => s + b.duration, 0);
  const assetAvailability = totalBlockTime > 0
    ? Math.round(((totalBlockTime - usedBlockTime) / totalBlockTime) * 100)
    : 100;

  return {
    pendingTasks,
    plannedTasks,
    completedTasks,
    totalTasks: tasks.length,
    scheduledBlocks,
    availableBlocks,
    totalBlocks: blocks.length,
    avgUtilization,
    crossDeptBundles,
    totalConflicts,
    criticalTasks: criticalTasks.length,
    criticalCovered,
    assetAvailability,
    totalTrains: trains.length,
  };
}
