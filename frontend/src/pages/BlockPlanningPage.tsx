import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

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
  duration: number;
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

/* =========================
   MAINTENANCE TASKS
========================= */

const initialTasks: MaintenanceTask[] = [
  {
    id: 'ENG-101',
    department: 'Engineering',
    asset: 'Track Inspection',
    location: 'DDN-Haridwar',
    priority: 'HIGH',
    risk: 87,
    duration: 60,
    deadline: '2026-09-30',
    status: 'PENDING'
  },
  {
    id: 'SNT-102',
    department: 'S&T',
    asset: 'Signal S-204 Maintenance',
    location: 'DDN-Haridwar',
    priority: 'MEDIUM',
    risk: 45,
    duration: 30,
    deadline: '2026-10-02',
    status: 'PENDING'
  },
  {
    id: 'TRC-103',
    department: 'Traction',
    asset: 'OHE Inspection',
    location: 'DDN-Haridwar',
    priority: 'HIGH',
    risk: 78,
    duration: 45,
    deadline: '2026-09-29',
    status: 'PENDING'
  },
  {
    id: 'ENG-104',
    department: 'Engineering',
    asset: 'Sleeper Replacement',
    location: 'Haridwar-Roorkee',
    priority: 'CRITICAL',
    risk: 95,
    duration: 120,
    deadline: '2026-09-27',
    status: 'PENDING'
  },
  {
    id: 'SNT-105',
    department: 'S&T',
    asset: 'Relay Room Inspection',
    location: 'Haridwar-Roorkee',
    priority: 'HIGH',
    risk: 72,
    duration: 45,
    deadline: '2026-09-30',
    status: 'PENDING'
  },
  {
    id: 'TRC-106',
    department: 'Traction',
    asset: 'OHE Isolator Check',
    location: 'Haridwar-Roorkee',
    priority: 'MEDIUM',
    risk: 55,
    duration: 30,
    deadline: '2026-10-03',
    status: 'PENDING'
  },
  {
    id: 'ENG-107',
    department: 'Engineering',
    asset: 'Rail Joint Inspection',
    location: 'Roorkee-Saharanpur',
    priority: 'HIGH',
    risk: 81,
    duration: 60,
    deadline: '2026-10-01',
    status: 'PENDING'
  }
];

/* =========================
   AVAILABLE BLOCK WINDOWS
========================= */

const initialBlocks: BlockWindow[] = [
  {
    id: 'B-104',
    section: 'DDN-Haridwar',
    date: '2026-09-28',
    startTime: '11:30',
    endTime: '14:00',
    duration: 150,
    status: 'AVAILABLE',
    bundledTasks: []
  },
  {
    id: 'B-105',
    section: 'Haridwar-Roorkee',
    date: '2026-09-28',
    startTime: '02:00',
    endTime: '05:00',
    duration: 180,
    status: 'AVAILABLE',
    bundledTasks: []
  },
  {
    id: 'B-106',
    section: 'Roorkee-Saharanpur',
    date: '2026-09-29',
    startTime: '12:00',
    endTime: '14:00',
    duration: 120,
    status: 'AVAILABLE',
    bundledTasks: []
  }
];

/* =========================
   TRAIN TIMETABLE
========================= */

const initialTrains: TrainMovement[] = [
  {
    id: '12055',
    name: 'Dehradun Jan Shatabdi',
    section: 'DDN-Haridwar',
    time: '12:05'
  },
  {
    id: '14631',
    name: 'Dehradun Express',
    section: 'DDN-Haridwar',
    time: '13:10'
  },
  {
    id: '19019',
    name: 'Dehradun Express',
    section: 'Haridwar-Roorkee',
    time: '02:30'
  },
  {
    id: '12038',
    name: 'Siddhabali Jan Shatabdi',
    section: 'Haridwar-Roorkee',
    time: '04:15'
  },
  {
    id: '14512',
    name: 'Nauchandi Express',
    section: 'Roorkee-Saharanpur',
    time: '13:00'
  },
  {
    id: '14309',
    name: 'Ujjain Express',
    section: 'Roorkee-Saharanpur',
    time: '13:40'
  }
];

export const BlockProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks);

  const [blocks, setBlocks] =
    useState<BlockWindow[]>(initialBlocks);

  const [trains] =
    useState<TrainMovement[]>(initialTrains);

  const [selectedTasks, setSelectedTasks] =
    useState<string[]>([]);

  const [isOptimizing, setIsOptimizing] =
    useState(false);

  const [optimizedBlocks, setOptimizedBlocks] =
    useState<BlockWindow[]>([]);

  /* =========================
     SELECT / UNSELECT TASK
  ========================= */

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  /* =========================
     CHECK TRAIN CONFLICT
  ========================= */

  const hasTrainConflict = (
    block: BlockWindow
  ) => {
    const blockStart =
      parseInt(block.startTime.split(':')[0]) * 60 +
      parseInt(block.startTime.split(':')[1]);

    const blockEnd =
      parseInt(block.endTime.split(':')[0]) * 60 +
      parseInt(block.endTime.split(':')[1]);

    return trains.some(train => {
      if (train.section !== block.section) return false;

      const [h, m] = train.time.split(':').map(Number);
      const trainTime = h * 60 + m;

      return (
        trainTime >= blockStart &&
        trainTime <= blockEnd
      );
    });
  };

  /* =========================
     AI / CONSTRAINT DEMO
  ========================= */

  const optimizePlan = () => {
    if (selectedTasks.length === 0) return;

    setIsOptimizing(true);

    setTimeout(() => {
      const selected =
        tasks.filter(task =>
          selectedTasks.includes(task.id)
        );

      const newBlocks =
        blocks.map(block => ({
          ...block,
          bundledTasks: [...block.bundledTasks]
        }));

      const updatedTaskIds: string[] = [];

      /*
        Group selected tasks by railway section.
      */

      const grouped =
        selected.reduce(
          (acc, task) => {
            if (!acc[task.location]) {
              acc[task.location] = [];
            }

            acc[task.location].push(task);

            return acc;
          },
          {} as Record<string, MaintenanceTask[]>
        );

      Object.entries(grouped).forEach(
        ([section, sectionTasks]) => {

          const possibleBlock =
            newBlocks.find(block => {
              if (block.section !== section) {
                return false;
              }

              if (block.status !== 'AVAILABLE') {
                return false;
              }

              if (hasTrainConflict(block)) {
                return false;
              }

              const totalDuration =
                sectionTasks.reduce(
                  (sum, task) =>
                    sum + task.duration,
                  0
                );

              return totalDuration <= block.duration;
            });

          if (!possibleBlock) return;

          const totalDuration =
            sectionTasks.reduce(
              (sum, task) =>
                sum + task.duration,
              0
            );

          possibleBlock.status = 'SCHEDULED';

          possibleBlock.bundledTasks =
            sectionTasks.map(task => task.id);

          updatedTaskIds.push(
            ...sectionTasks.map(task => task.id)
          );

          console.log(
            `Optimized ${section}: ${totalDuration}/${possibleBlock.duration} minutes`
          );
        }
      );

      setBlocks(newBlocks);

      setTasks(previous =>
        previous.map(task =>
          updatedTaskIds.includes(task.id)
            ? {
                ...task,
                status: 'PLANNED'
              }
            : task
        )
      );

      setOptimizedBlocks(
        newBlocks.filter(
          block => block.status === 'SCHEDULED'
        )
      );

      setSelectedTasks([]);

      setIsOptimizing(false);
    }, 1500);
  };

  /* =========================
     EMERGENCY DEFECT
  ========================= */

  const addEmergencyDefect = () => {
    const emergency: MaintenanceTask = {
      id: `EM-${Date.now()}`,
      department: 'Engineering',
      asset: 'Critical Track Fracture',
      location: 'DDN-Haridwar',
      priority: 'CRITICAL',
      risk: 99,
      duration: 90,
      deadline: 'IMMEDIATE',
      status: 'PENDING'
    };

    setTasks(previous => [
      emergency,
      ...previous
    ]);
  };

  return (
    <BlockContext.Provider
      value={{
        tasks,
        blocks,
        trains,
        toggleTaskSelection,
        selectedTasks,
        optimizePlan,
        isOptimizing,
        optimizedBlocks,
        addEmergencyDefect
      }}
    >
      {children}
    </BlockContext.Provider>
  );
};

export const useBlockContext = () => {
  const context = useContext(BlockContext);

  if (!context) {
    throw new Error(
      'useBlockContext must be used within BlockProvider'
    );
  }

  return context;
};