/* ═══════════════════════════════════════════════════════════════
   RAILSYNC AI — Centralized Block Context
   Single source of truth for all pages
   ═══════════════════════════════════════════════════════════════ */

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  STATIONS, SECTIONS, TRAINS, TIMETABLE, TRAIN_MOVEMENTS,
  INITIAL_TASKS, INITIAL_BLOCKS, INITIAL_BLOCK_REQUESTS, DEFAULT_SCENARIOS,
  type Station, type RailwaySection, type TrainEntry, type TimetableEntry,
  type TrainMovement, type MaintenanceTask, type BlockWindow,
  type BlockRequest, type Defect, type WhatIfScenario,
} from '../data/railwayData';
import {
  optimizeBlocks, checkTrainConflicts, calculateRiskScore,
  type OptimizedPlan,
} from '../utils/planningEngine';

// Re-export types for convenience
export type {
  Station, RailwaySection, TrainEntry, TimetableEntry, TrainMovement,
  MaintenanceTask, BlockWindow, BlockRequest, Defect, WhatIfScenario,
};
export type { Department, Priority, TaskStatus, BlockStatus, ApprovalStatus, TrainType } from '../data/railwayData';

interface BlockContextType {
  // Data
  stations: Station[];
  sections: RailwaySection[];
  trains: TrainEntry[];
  timetable: TimetableEntry[];
  trainMovements: TrainMovement[];
  tasks: MaintenanceTask[];
  blocks: BlockWindow[];
  blockRequests: BlockRequest[];
  defects: Defect[];
  scenarios: WhatIfScenario[];

  // Selection
  selectedTasks: string[];
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;

  // Optimization
  isOptimizing: boolean;
  optimizedPlan: OptimizedPlan | null;
  optimizePlan: () => void;
  resetOptimization: () => void;

  // Emergency
  addEmergencyDefect: (section?: string) => void;

  // Approvals
  approveBlock: (blockId: string) => void;
  rejectBlock: (blockId: string) => void;

  // What-If
  applyScenario: (scenarioId: string) => void;
  resetScenarios: () => void;
  reOptimize: () => void;

  // Block Requests
  updateRequestStatus: (requestId: string, status: BlockRequest['status']) => void;
}

const BlockContext = createContext<BlockContextType | undefined>(undefined);

export function BlockProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(INITIAL_TASKS);
  const [blocks, setBlocks] = useState<BlockWindow[]>(INITIAL_BLOCKS);
  const [blockRequests, setBlockRequests] = useState<BlockRequest[]>(INITIAL_BLOCK_REQUESTS);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [scenarios, setScenarios] = useState<WhatIfScenario[]>(DEFAULT_SCENARIOS);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPlan, setOptimizedPlan] = useState<OptimizedPlan | null>(null);

  // ─── Selection ──────────────────────────────────────────────

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  const selectAllTasks = useCallback(() => {
    const pendingIds = tasks.filter(t => t.status === 'PENDING').map(t => t.id);
    setSelectedTasks(pendingIds);
  }, [tasks]);

  const clearSelection = useCallback(() => {
    setSelectedTasks([]);
  }, []);

  // ─── Optimization ──────────────────────────────────────────

  const optimizePlan = useCallback(() => {
    if (selectedTasks.length === 0) return;
    setIsOptimizing(true);

    // Simulate computation delay for demo effect
    setTimeout(() => {
      const plan = optimizeBlocks(tasks, blocks, TRAIN_MOVEMENTS, selectedTasks);

      // Update blocks
      setBlocks(plan.blocks);

      // Update task statuses
      const assignedIds = new Set<string>();
      for (const ids of Object.values(plan.taskAssignments)) {
        ids.forEach(id => assignedIds.add(id));
      }

      setTasks(prev => prev.map(t =>
        assignedIds.has(t.id) ? { ...t, status: 'PLANNED' as const } : t
      ));

      // Update block requests
      setBlockRequests(prev => prev.map(r =>
        assignedIds.has(r.taskId) ? { ...r, status: 'PLANNED' as const } : r
      ));

      setOptimizedPlan(plan);
      setSelectedTasks([]);
      setIsOptimizing(false);
    }, 1800);
  }, [selectedTasks, tasks, blocks]);

  const resetOptimization = useCallback(() => {
    setBlocks(INITIAL_BLOCKS);
    setTasks(INITIAL_TASKS);
    setBlockRequests(INITIAL_BLOCK_REQUESTS);
    setOptimizedPlan(null);
    setSelectedTasks([]);
  }, []);

  // ─── Emergency Defect ───────────────────────────────────────

  const addEmergencyDefect = useCallback((section: string = 'DDN-HW') => {
    const sectionData = SECTIONS.find(s => s.id === section);
    const sectionLabel = sectionData ? sectionData.label : section;

    const emergencyTask: MaintenanceTask = {
      id: `EM-${Date.now()}`,
      department: 'Engineering',
      asset: 'Critical Track Fracture',
      location: sectionLabel,
      section,
      priority: 'CRITICAL',
      risk: 99,
      duration: 90,
      deadline: 'IMMEDIATE',
      status: 'PENDING',
      description: 'EMERGENCY: Critical rail fracture detected. Requires immediate block for repair.',
      safetyImpact: 'CRITICAL',
    };

    const newDefect: Defect = {
      id: `DEF-${Date.now()}`,
      type: 'Track Fracture',
      location: sectionLabel,
      section,
      severity: 'CRITICAL',
      risk: 99,
      reportedAt: new Date().toISOString(),
      duration: 90,
      status: 'OPEN',
    };

    setTasks(prev => [emergencyTask, ...prev]);
    setDefects(prev => [newDefect, ...prev]);

    // Auto-select the emergency task
    setSelectedTasks(prev => [emergencyTask.id, ...prev]);
  }, []);

  // ─── Approvals ──────────────────────────────────────────────

  const approveBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId
        ? { ...b, status: 'APPROVED' as const, approvalStatus: 'APPROVED' as const, approvedBy: 'COA Officer' }
        : b
    ));
    // Update associated task statuses and requests
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      setBlockRequests(prev => prev.map(r =>
        block.bundledTasks.includes(r.taskId) ? { ...r, status: 'APPROVED' as const } : r
      ));
    }
  }, [blocks]);

  const rejectBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId
        ? { ...b, status: 'AVAILABLE' as const, approvalStatus: 'REJECTED' as const, bundledTasks: [], utilization: 0 }
        : b
    ));
    // Revert tasks to PENDING
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      setTasks(prev => prev.map(t =>
        block.bundledTasks.includes(t.id) ? { ...t, status: 'PENDING' as const } : t
      ));
      setBlockRequests(prev => prev.map(r =>
        block.bundledTasks.includes(r.taskId) ? { ...r, status: 'REJECTED' as const } : r
      ));
    }
  }, [blocks]);

  // ─── What-If ────────────────────────────────────────────────

  const applyScenario = useCallback((scenarioId: string) => {
    setScenarios(prev => prev.map(s =>
      s.id === scenarioId ? { ...s, applied: true } : s
    ));

    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    switch (scenario.type) {
      case 'ADD_DEFECT':
        addEmergencyDefect(scenario.parameters.section as string);
        break;
      case 'INCREASE_DURATION': {
        const taskId = scenario.parameters.taskId as string;
        const newDuration = scenario.parameters.newDuration as number;
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, duration: newDuration } : t
        ));
        break;
      }
      case 'REMOVE_BLOCK': {
        const blockId = scenario.parameters.blockId as string;
        setBlocks(prev => prev.filter(b => b.id !== blockId));
        break;
      }
      default:
        break;
    }
  }, [scenarios, addEmergencyDefect]);

  const resetScenarios = useCallback(() => {
    setScenarios(DEFAULT_SCENARIOS);
    setTasks(INITIAL_TASKS);
    setBlocks(INITIAL_BLOCKS);
    setBlockRequests(INITIAL_BLOCK_REQUESTS);
    setDefects([]);
    setOptimizedPlan(null);
    setSelectedTasks([]);
  }, []);

  const reOptimize = useCallback(() => {
    // Select all pending tasks and re-run
    const pendingIds = tasks.filter(t => t.status === 'PENDING').map(t => t.id);
    setSelectedTasks(pendingIds);
    // We need to delay the optimization call until state is updated
    setTimeout(() => {
      setIsOptimizing(true);
      setTimeout(() => {
        const plan = optimizeBlocks(
          tasks,
          blocks.map(b => ({ ...b, status: b.status === 'SCHEDULED' ? 'AVAILABLE' as const : b.status, bundledTasks: b.status === 'SCHEDULED' ? [] : b.bundledTasks, utilization: b.status === 'SCHEDULED' ? 0 : b.utilization })),
          TRAIN_MOVEMENTS,
          pendingIds
        );
        setBlocks(plan.blocks);
        const assignedIds = new Set<string>();
        for (const ids of Object.values(plan.taskAssignments)) {
          ids.forEach(id => assignedIds.add(id));
        }
        setTasks(prev => prev.map(t =>
          assignedIds.has(t.id) ? { ...t, status: 'PLANNED' as const } : t
        ));
        setOptimizedPlan(plan);
        setSelectedTasks([]);
        setIsOptimizing(false);
      }, 1500);
    }, 100);
  }, [tasks, blocks]);

  // ─── Block Requests ─────────────────────────────────────────

  const updateRequestStatus = useCallback((requestId: string, status: BlockRequest['status']) => {
    setBlockRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status } : r
    ));
  }, []);

  return (
    <BlockContext.Provider value={{
      stations: STATIONS,
      sections: SECTIONS,
      trains: TRAINS,
      timetable: TIMETABLE,
      trainMovements: TRAIN_MOVEMENTS,
      tasks,
      blocks,
      blockRequests,
      defects,
      scenarios,
      selectedTasks,
      toggleTaskSelection,
      selectAllTasks,
      clearSelection,
      isOptimizing,
      optimizedPlan,
      optimizePlan,
      resetOptimization,
      addEmergencyDefect,
      approveBlock,
      rejectBlock,
      applyScenario,
      resetScenarios,
      reOptimize,
      updateRequestStatus,
    }}>
      {children}
    </BlockContext.Provider>
  );
}

export function useBlockContext() {
  const context = useContext(BlockContext);
  if (!context) throw new Error('useBlockContext must be used within BlockProvider');
  return context;
}
