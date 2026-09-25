import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Task Types
export type Department = 'Engineering' | 'S&T' | 'Traction';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'PENDING' | 'PLANNED' | 'COMPLETED';

export interface MaintenanceTask {
  id: string;
  department: Department;
  asset: string;
  location: string;
  priority: Priority;
  risk: number;
  duration: number; // in minutes
  deadline: string;
  status: TaskStatus;
}

export interface BlockWindow {
  id: string;
  section: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'AVAILABLE' | 'SCHEDULED' | 'EMERGENCY';
  bundledTasks: string[];
}

export interface TrainMovement {
  id: string;
  name: string;
  section: string;
  time: string;
}

interface BlockContextType {
  tasks: MaintenanceTask[];
  blocks: BlockWindow[];
  trains: TrainMovement[];
  toggleTaskSelection: (taskId: string) => void;
  selectedTasks: string[];
  optimizePlan: () => void;
  isOptimizing: boolean;
  optimizedBlocks: BlockWindow[];
  addEmergencyDefect: () => void;
}

const BlockContext = createContext<BlockContextType | undefined>(undefined);

const initialTasks: MaintenanceTask[] = [
  { id: 'T-101', department: 'Engineering', asset: 'Track Inspection', location: 'DDN-Haridwar', priority: 'HIGH', risk: 87, duration: 60, deadline: '2026-09-30', status: 'PENDING' },
  { id: 'T-102', department: 'S&T', asset: 'Signal S-204 Maintenance', location: 'DDN-Haridwar', priority: 'MEDIUM', risk: 45, duration: 30, deadline: '2026-10-02', status: 'PENDING' },
  { id: 'T-103', department: 'Traction', asset: 'OHE Inspection', location: 'DDN-Haridwar', priority: 'HIGH', risk: 78, duration: 45, deadline: '2026-09-29', status: 'PENDING' },
  { id: 'T-104', department: 'Engineering', asset: 'Sleeper Replacement', location: 'Haridwar-Roorkee', priority: 'CRITICAL', risk: 95, duration: 120, deadline: '2026-09-27', status: 'PENDING' },
];

const initialBlocks: BlockWindow[] = [
  { id: 'B-104', section: 'DDN-Haridwar', date: '2026-09-28', startTime: '11:30', endTime: '14:00', duration: 150, status: 'AVAILABLE', bundledTasks: [] },
  { id: 'B-105', section: 'Haridwar-Roorkee', date: '2026-09-28', startTime: '02:00', endTime: '05:00', duration: 180, status: 'AVAILABLE', bundledTasks: [] },
];

export const BlockProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks);
  const [blocks, setBlocks] = useState<BlockWindow[]>(initialBlocks);
  const [trains, setTrains] = useState<TrainMovement[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedBlocks, setOptimizedBlocks] = useState<BlockWindow[]>([]);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const optimizePlan = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      // Mock Optimizer Logic (Google OR-Tools CP-SAT simulation)
      const selected = tasks.filter(t => selectedTasks.includes(t.id));
      const sectionGrouped = selected.reduce((acc, task) => {
        acc[task.location] = acc[task.location] || [];
        acc[task.location].push(task);
        return acc;
      }, {} as Record<string, MaintenanceTask[]>);

      const newOptimized = [...blocks];
      
      for (const section in sectionGrouped) {
        const availableBlock = newOptimized.find(b => b.section === section && b.status === 'AVAILABLE');
        if (availableBlock) {
          const tasksForBlock = sectionGrouped[section];
          const totalDuration = tasksForBlock.reduce((sum, t) => sum + t.duration, 0);
          if (totalDuration <= availableBlock.duration) {
             availableBlock.status = 'SCHEDULED';
             availableBlock.bundledTasks = tasksForBlock.map(t => t.id);
             
             // Update task status
             setTasks(prev => prev.map(t => 
                tasksForBlock.some(tb => tb.id === t.id) ? { ...t, status: 'PLANNED' } : t
             ));
          }
        }
      }
      
      setOptimizedBlocks(newOptimized.filter(b => b.status === 'SCHEDULED'));
      setIsOptimizing(false);
    }, 2000);
  };

  const addEmergencyDefect = () => {
    const emergency: MaintenanceTask = {
      id: `E-${Math.floor(Math.random() * 1000)}`,
      department: 'Engineering',
      asset: 'Track Fracture',
      location: 'DDN-Haridwar',
      priority: 'CRITICAL',
      risk: 99,
      duration: 180,
      deadline: 'Immediate',
      status: 'PENDING'
    };
    setTasks([emergency, ...tasks]);
  };

  return (
    <BlockContext.Provider value={{
      tasks, blocks, trains, toggleTaskSelection, selectedTasks, optimizePlan, isOptimizing, optimizedBlocks, addEmergencyDefect
    }}>
      {children}
    </BlockContext.Provider>
  );
};

export const useBlockContext = () => {
  const context = useContext(BlockContext);
  if (!context) throw new Error('useBlockContext must be used within BlockProvider');
  return context;
};
