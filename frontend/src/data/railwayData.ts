/* ═══════════════════════════════════════════════════════════════
   RAILSYNC AI — Centralized Synthetic Railway Data
   Dehradun–Delhi (Northern Railway) corridor
   ═══════════════════════════════════════════════════════════════
   NOTE: This is synthetic demo data for the SIH 2026 prototype.
   It does NOT represent real Indian Railways operational data.
   ═══════════════════════════════════════════════════════════════ */

// ─── Types ───────────────────────────────────────────────────

export type Department = 'Engineering' | 'S&T' | 'Traction';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus = 'PENDING' | 'PLANNED' | 'COMPLETED';
export type BlockStatus = 'AVAILABLE' | 'SCHEDULED' | 'APPROVED' | 'EMERGENCY';
export type ApprovalStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
export type TrainType = 'Rajdhani' | 'Shatabdi' | 'Jan Shatabdi' | 'Superfast' | 'Mail/Express' | 'Passenger' | 'Goods';

export interface Station {
  id: number;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  platformCount: number;
  zone: string;
  isJunction: boolean;
}

export interface RailwaySection {
  id: string;
  from: string; // station code
  to: string;   // station code
  label: string; // human readable
  distanceKm: number;
  maxSpeed: number;
  trackType: 'Single' | 'Double';
}

export interface TrainEntry {
  id: string;
  number: string;
  name: string;
  type: TrainType;
  origin: string; // station code
  destination: string; // station code
  maxSpeed: number;
  priority: number; // 1=highest
  status: 'on_time' | 'delayed' | 'cancelled';
  capacity: number;
}

export interface TimetableEntry {
  id: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  trainType: TrainType;
  section: string;  // e.g. "DDN-HW"
  origin: string;
  destination: string;
  arrival: string;  // HH:MM
  departure: string; // HH:MM
  day: number;
  status: 'on_time' | 'delayed';
  delayMinutes: number;
}

export interface MaintenanceTask {
  id: string;
  department: Department;
  asset: string;
  location: string; // section label
  section: string;  // section id for matching
  priority: Priority;
  risk: number;     // 0-100
  duration: number;  // minutes
  deadline: string;  // date string
  status: TaskStatus;
  description: string;
  safetyImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface BlockWindow {
  id: string;
  section: string;  // section label
  sectionId: string; // section id
  date: string;
  startTime: string;
  endTime: string;
  duration: number;  // minutes
  status: BlockStatus;
  bundledTasks: string[];
  approvalStatus: ApprovalStatus;
  approvedBy: string | null;
  trainConflicts: string[];
  utilization: number; // percentage
}

export interface BlockRequest {
  id: string;
  department: Department;
  taskId: string;
  taskDescription: string;
  section: string;
  requestedDate: string;
  startTime: string;
  duration: number;
  priority: Priority;
  status: 'PENDING' | 'PLANNED' | 'APPROVED' | 'REJECTED';
}

export interface TrainMovement {
  id: string;
  trainNumber: string;
  name: string;
  section: string;
  time: string;
  direction: 'UP' | 'DOWN';
}

export interface Defect {
  id: string;
  type: string;
  location: string;
  section: string;
  severity: Priority;
  risk: number;
  reportedAt: string;
  duration: number;
  status: 'OPEN' | 'ASSIGNED' | 'RESOLVED';
}

export interface WhatIfScenario {
  id: string;
  name: string;
  type: 'ADD_TRAIN' | 'ADD_DEFECT' | 'INCREASE_DURATION' | 'REDUCE_BLOCK' | 'DELAY_TRAIN' | 'REMOVE_BLOCK';
  description: string;
  applied: boolean;
  parameters: Record<string, string | number>;
}

// ─── Stations ────────────────────────────────────────────────

export const STATIONS: Station[] = [
  { id: 1, code: 'DDN', name: 'Dehradun', latitude: 30.3165, longitude: 78.0322, platformCount: 6, zone: 'NR', isJunction: true },
  { id: 2, code: 'HW', name: 'Haridwar', latitude: 29.9457, longitude: 78.1642, platformCount: 8, zone: 'NR', isJunction: true },
  { id: 3, code: 'RK', name: 'Roorkee', latitude: 29.8543, longitude: 77.8880, platformCount: 4, zone: 'NR', isJunction: false },
  { id: 4, code: 'SRE', name: 'Saharanpur', latitude: 29.9680, longitude: 77.5510, platformCount: 5, zone: 'NR', isJunction: true },
  { id: 5, code: 'DLI', name: 'Delhi', latitude: 28.6615, longitude: 77.2286, platformCount: 16, zone: 'NR', isJunction: true },
  { id: 6, code: 'LKU', name: 'Laksar', latitude: 29.7600, longitude: 78.0300, platformCount: 3, zone: 'NR', isJunction: true },
  { id: 7, code: 'RKSH', name: 'Raipur (Roorkee Side Halt)', latitude: 29.8900, longitude: 77.9400, platformCount: 2, zone: 'NR', isJunction: false },
  { id: 8, code: 'MZP', name: 'Muzaffarnagar', latitude: 29.4727, longitude: 77.7085, platformCount: 4, zone: 'NR', isJunction: false },
];

// ─── Sections ────────────────────────────────────────────────

export const SECTIONS: RailwaySection[] = [
  { id: 'DDN-HW', from: 'DDN', to: 'HW', label: 'DDN-Haridwar', distanceKm: 53, maxSpeed: 100, trackType: 'Single' },
  { id: 'HW-RK', from: 'HW', to: 'RK', label: 'Haridwar-Roorkee', distanceKm: 32, maxSpeed: 110, trackType: 'Double' },
  { id: 'RK-SRE', from: 'RK', to: 'SRE', label: 'Roorkee-Saharanpur', distanceKm: 62, maxSpeed: 120, trackType: 'Double' },
  { id: 'SRE-DLI', from: 'SRE', to: 'DLI', label: 'Saharanpur-Delhi', distanceKm: 180, maxSpeed: 130, trackType: 'Double' },
  { id: 'HW-LKU', from: 'HW', to: 'LKU', label: 'Haridwar-Laksar', distanceKm: 24, maxSpeed: 100, trackType: 'Single' },
];

// ─── Trains ──────────────────────────────────────────────────

export const TRAINS: TrainEntry[] = [
  { id: 'T01', number: '12055', name: 'Dehradun Jan Shatabdi', type: 'Jan Shatabdi', origin: 'DDN', destination: 'DLI', maxSpeed: 110, priority: 2, status: 'on_time', capacity: 1024 },
  { id: 'T02', number: '12017', name: 'Dehradun Shatabdi', type: 'Shatabdi', origin: 'DDN', destination: 'DLI', maxSpeed: 130, priority: 1, status: 'on_time', capacity: 786 },
  { id: 'T03', number: '14631', name: 'Dehradun Express', type: 'Mail/Express', origin: 'DDN', destination: 'DLI', maxSpeed: 100, priority: 3, status: 'delayed', capacity: 1800 },
  { id: 'T04', number: '19019', name: 'Dehradun Express', type: 'Mail/Express', origin: 'DDN', destination: 'SRE', maxSpeed: 90, priority: 3, status: 'on_time', capacity: 1500 },
  { id: 'T05', number: '12038', name: 'Siddhabali Express', type: 'Superfast', origin: 'HW', destination: 'DLI', maxSpeed: 120, priority: 2, status: 'on_time', capacity: 1200 },
  { id: 'T06', number: '14512', name: 'Nauchandi Express', type: 'Mail/Express', origin: 'DDN', destination: 'DLI', maxSpeed: 100, priority: 3, status: 'on_time', capacity: 1600 },
  { id: 'T07', number: '14309', name: 'Ujjain Express', type: 'Mail/Express', origin: 'DDN', destination: 'DLI', maxSpeed: 100, priority: 4, status: 'delayed', capacity: 1800 },
  { id: 'T08', number: '12687', name: 'Dehradun Superfast', type: 'Superfast', origin: 'DDN', destination: 'DLI', maxSpeed: 120, priority: 2, status: 'on_time', capacity: 1100 },
  { id: 'T09', number: '14041', name: 'Mussoorie Express', type: 'Passenger', origin: 'DDN', destination: 'DLI', maxSpeed: 80, priority: 5, status: 'on_time', capacity: 2000 },
  { id: 'T10', number: 'G-4501', name: 'Goods Rake (Coal)', type: 'Goods', origin: 'SRE', destination: 'DDN', maxSpeed: 60, priority: 5, status: 'on_time', capacity: 4000 },
  { id: 'T11', number: 'G-4502', name: 'Goods Rake (Container)', type: 'Goods', origin: 'DLI', destination: 'HW', maxSpeed: 60, priority: 5, status: 'delayed', capacity: 3500 },
  { id: 'T12', number: '12205', name: 'Nanda Devi Express', type: 'Superfast', origin: 'DDN', destination: 'DLI', maxSpeed: 115, priority: 2, status: 'on_time', capacity: 1300 },
];

// ─── Timetable ───────────────────────────────────────────────

export const TIMETABLE: TimetableEntry[] = [
  // 12055 Jan Shatabdi
  { id: 'TT-01', trainId: 'T01', trainNumber: '12055', trainName: 'Dehradun Jan Shatabdi', trainType: 'Jan Shatabdi', section: 'DDN-HW', origin: 'DDN', destination: 'HW', arrival: '06:15', departure: '06:20', day: 1, status: 'on_time', delayMinutes: 0 },
  { id: 'TT-02', trainId: 'T01', trainNumber: '12055', trainName: 'Dehradun Jan Shatabdi', trainType: 'Jan Shatabdi', section: 'HW-RK', origin: 'HW', destination: 'RK', arrival: '07:00', departure: '07:02', day: 1, status: 'on_time', delayMinutes: 0 },
  { id: 'TT-03', trainId: 'T01', trainNumber: '12055', trainName: 'Dehradun Jan Shatabdi', trainType: 'Jan Shatabdi', section: 'RK-SRE', origin: 'RK', destination: 'SRE', arrival: '07:45', departure: '07:48', day: 1, status: 'on_time', delayMinutes: 0 },

  // 12017 Shatabdi
  { id: 'TT-04', trainId: 'T02', trainNumber: '12017', trainName: 'Dehradun Shatabdi', trainType: 'Shatabdi', section: 'DDN-HW', origin: 'DDN', destination: 'HW', arrival: '07:10', departure: '07:15', day: 1, status: 'on_time', delayMinutes: 0 },
  { id: 'TT-05', trainId: 'T02', trainNumber: '12017', trainName: 'Dehradun Shatabdi', trainType: 'Shatabdi', section: 'HW-RK', origin: 'HW', destination: 'RK', arrival: '07:50', departure: '07:52', day: 1, status: 'on_time', delayMinutes: 0 },

  // 14631 Dehradun Express (delayed)
  { id: 'TT-06', trainId: 'T03', trainNumber: '14631', trainName: 'Dehradun Express', trainType: 'Mail/Express', section: 'DDN-HW', origin: 'DDN', destination: 'HW', arrival: '13:10', departure: '13:15', day: 1, status: 'delayed', delayMinutes: 15 },
  { id: 'TT-07', trainId: 'T03', trainNumber: '14631', trainName: 'Dehradun Express', trainType: 'Mail/Express', section: 'HW-RK', origin: 'HW', destination: 'RK', arrival: '14:00', departure: '14:05', day: 1, status: 'delayed', delayMinutes: 15 },

  // 19019 
  { id: 'TT-08', trainId: 'T04', trainNumber: '19019', trainName: 'Dehradun Express', trainType: 'Mail/Express', section: 'HW-RK', origin: 'HW', destination: 'RK', arrival: '02:30', departure: '02:35', day: 1, status: 'on_time', delayMinutes: 0 },

  // 12038 Siddhabali
  { id: 'TT-09', trainId: 'T05', trainNumber: '12038', trainName: 'Siddhabali Express', trainType: 'Superfast', section: 'HW-RK', origin: 'HW', destination: 'RK', arrival: '04:15', departure: '04:18', day: 1, status: 'on_time', delayMinutes: 0 },

  // 14512 Nauchandi
  { id: 'TT-10', trainId: 'T06', trainNumber: '14512', trainName: 'Nauchandi Express', trainType: 'Mail/Express', section: 'RK-SRE', origin: 'RK', destination: 'SRE', arrival: '13:00', departure: '13:05', day: 1, status: 'on_time', delayMinutes: 0 },

  // 14309 Ujjain
  { id: 'TT-11', trainId: 'T07', trainNumber: '14309', trainName: 'Ujjain Express', trainType: 'Mail/Express', section: 'RK-SRE', origin: 'RK', destination: 'SRE', arrival: '13:40', departure: '13:45', day: 1, status: 'delayed', delayMinutes: 10 },

  // 12055 Jan Shatabdi - also on DDN-HW at 12:05 (UP direction return)
  { id: 'TT-12', trainId: 'T01', trainNumber: '12055', trainName: 'Dehradun Jan Shatabdi (Return)', trainType: 'Jan Shatabdi', section: 'DDN-HW', origin: 'HW', destination: 'DDN', arrival: '12:05', departure: '12:10', day: 1, status: 'on_time', delayMinutes: 0 },

  // Goods
  { id: 'TT-13', trainId: 'T10', trainNumber: 'G-4501', trainName: 'Goods Rake (Coal)', trainType: 'Goods', section: 'SRE-DLI', origin: 'SRE', destination: 'DDN', arrival: '03:00', departure: '03:05', day: 1, status: 'on_time', delayMinutes: 0 },
  { id: 'TT-14', trainId: 'T11', trainNumber: 'G-4502', trainName: 'Goods Rake (Container)', trainType: 'Goods', section: 'HW-RK', origin: 'DLI', destination: 'HW', arrival: '01:30', departure: '01:35', day: 1, status: 'delayed', delayMinutes: 25 },

  // 12205 Nanda Devi
  { id: 'TT-15', trainId: 'T12', trainNumber: '12205', trainName: 'Nanda Devi Express', trainType: 'Superfast', section: 'DDN-HW', origin: 'DDN', destination: 'HW', arrival: '15:30', departure: '15:35', day: 1, status: 'on_time', delayMinutes: 0 },
  { id: 'TT-16', trainId: 'T12', trainNumber: '12205', trainName: 'Nanda Devi Express', trainType: 'Superfast', section: 'HW-RK', origin: 'HW', destination: 'RK', arrival: '16:10', departure: '16:15', day: 1, status: 'on_time', delayMinutes: 0 },
];

// ─── Train Movements (for conflict checking) ────────────────

export const TRAIN_MOVEMENTS: TrainMovement[] = [
  { id: 'TM-01', trainNumber: '12055', name: 'Dehradun Jan Shatabdi', section: 'DDN-HW', time: '06:15', direction: 'DOWN' },
  { id: 'TM-02', trainNumber: '12017', name: 'Dehradun Shatabdi', section: 'DDN-HW', time: '07:10', direction: 'DOWN' },
  { id: 'TM-03', trainNumber: '12055', name: 'Dehradun Jan Shatabdi (Return)', section: 'DDN-HW', time: '12:05', direction: 'UP' },
  { id: 'TM-04', trainNumber: '14631', name: 'Dehradun Express', section: 'DDN-HW', time: '13:10', direction: 'DOWN' },
  { id: 'TM-05', trainNumber: '12205', name: 'Nanda Devi Express', section: 'DDN-HW', time: '15:30', direction: 'DOWN' },
  { id: 'TM-06', trainNumber: '19019', name: 'Dehradun Express', section: 'HW-RK', time: '02:30', direction: 'DOWN' },
  { id: 'TM-07', trainNumber: '12038', name: 'Siddhabali Express', section: 'HW-RK', time: '04:15', direction: 'DOWN' },
  { id: 'TM-08', trainNumber: '14631', name: 'Dehradun Express', section: 'HW-RK', time: '14:00', direction: 'DOWN' },
  { id: 'TM-09', trainNumber: 'G-4502', name: 'Goods Rake (Container)', section: 'HW-RK', time: '01:30', direction: 'UP' },
  { id: 'TM-10', trainNumber: '14512', name: 'Nauchandi Express', section: 'RK-SRE', time: '13:00', direction: 'DOWN' },
  { id: 'TM-11', trainNumber: '14309', name: 'Ujjain Express', section: 'RK-SRE', time: '13:40', direction: 'DOWN' },
  { id: 'TM-12', trainNumber: 'G-4501', name: 'Goods Rake (Coal)', section: 'SRE-DLI', time: '03:00', direction: 'UP' },
  { id: 'TM-13', trainNumber: '12687', name: 'Dehradun Superfast', section: 'DDN-HW', time: '09:30', direction: 'DOWN' },
  { id: 'TM-14', trainNumber: '14041', name: 'Mussoorie Express', section: 'DDN-HW', time: '17:00', direction: 'DOWN' },
];

// ─── Maintenance Tasks ───────────────────────────────────────

export const INITIAL_TASKS: MaintenanceTask[] = [
  {
    id: 'ENG-101', department: 'Engineering', asset: 'Track Inspection', location: 'DDN-Haridwar', section: 'DDN-HW',
    priority: 'HIGH', risk: 87, duration: 60, deadline: '2026-09-30', status: 'PENDING',
    description: 'Routine ultrasonic flaw detection on track between DDN and Haridwar.',
    safetyImpact: 'HIGH'
  },
  {
    id: 'SNT-102', department: 'S&T', asset: 'Signal S-204 Maintenance', location: 'DDN-Haridwar', section: 'DDN-HW',
    priority: 'MEDIUM', risk: 45, duration: 30, deadline: '2026-10-02', status: 'PENDING',
    description: 'Preventive maintenance of automatic signal S-204 and associated relay room.',
    safetyImpact: 'MEDIUM'
  },
  {
    id: 'TRC-103', department: 'Traction', asset: 'OHE Inspection', location: 'DDN-Haridwar', section: 'DDN-HW',
    priority: 'HIGH', risk: 78, duration: 45, deadline: '2026-09-29', status: 'PENDING',
    description: 'OHE (Overhead Equipment) contact wire height and stagger measurement.',
    safetyImpact: 'HIGH'
  },
  {
    id: 'ENG-104', department: 'Engineering', asset: 'Sleeper Replacement', location: 'Haridwar-Roorkee', section: 'HW-RK',
    priority: 'CRITICAL', risk: 95, duration: 120, deadline: '2026-09-27', status: 'PENDING',
    description: 'Emergency replacement of 50 PSC sleepers showing critical deterioration.',
    safetyImpact: 'CRITICAL'
  },
  {
    id: 'SNT-105', department: 'S&T', asset: 'Relay Room Inspection', location: 'Haridwar-Roorkee', section: 'HW-RK',
    priority: 'HIGH', risk: 72, duration: 45, deadline: '2026-09-30', status: 'PENDING',
    description: 'Inspection and cleaning of all relays in Laksar relay room.',
    safetyImpact: 'HIGH'
  },
  {
    id: 'TRC-106', department: 'Traction', asset: 'OHE Isolator Check', location: 'Haridwar-Roorkee', section: 'HW-RK',
    priority: 'MEDIUM', risk: 55, duration: 30, deadline: '2026-10-03', status: 'PENDING',
    description: 'Inspection and operation test of motorized isolators between HW-RK.',
    safetyImpact: 'MEDIUM'
  },
  {
    id: 'ENG-107', department: 'Engineering', asset: 'Rail Joint Inspection', location: 'Roorkee-Saharanpur', section: 'RK-SRE',
    priority: 'HIGH', risk: 81, duration: 60, deadline: '2026-10-01', status: 'PENDING',
    description: 'Inspection of fishplate joints and bolt torque verification.',
    safetyImpact: 'HIGH'
  },
  {
    id: 'SNT-108', department: 'S&T', asset: 'Level Crossing Gate Repair', location: 'Roorkee-Saharanpur', section: 'RK-SRE',
    priority: 'HIGH', risk: 85, duration: 40, deadline: '2026-09-29', status: 'PENDING',
    description: 'Repair of LC gate No. 47B lifting mechanism and warning bell system.',
    safetyImpact: 'CRITICAL'
  },
  {
    id: 'TRC-109', department: 'Traction', asset: 'Pantograph Clearance Check', location: 'Roorkee-Saharanpur', section: 'RK-SRE',
    priority: 'MEDIUM', risk: 50, duration: 35, deadline: '2026-10-05', status: 'PENDING',
    description: 'Pantograph clearance measurement at all OHE structures on section.',
    safetyImpact: 'MEDIUM'
  },
  {
    id: 'ENG-110', department: 'Engineering', asset: 'Bridge Inspection', location: 'DDN-Haridwar', section: 'DDN-HW',
    priority: 'CRITICAL', risk: 92, duration: 90, deadline: '2026-09-28', status: 'PENDING',
    description: 'Monsoon inspection of Bridge No. 48 over Song River. Check scour depth and pier condition.',
    safetyImpact: 'CRITICAL'
  },
  {
    id: 'ENG-111', department: 'Engineering', asset: 'Ballast Tamping', location: 'Saharanpur-Delhi', section: 'SRE-DLI',
    priority: 'MEDIUM', risk: 55, duration: 180, deadline: '2026-10-10', status: 'PENDING',
    description: 'Machine tamping for 5 km stretch near Muzaffarnagar.',
    safetyImpact: 'MEDIUM'
  },
  {
    id: 'SNT-112', department: 'S&T', asset: 'Telecom Cable Repair', location: 'Saharanpur-Delhi', section: 'SRE-DLI',
    priority: 'LOW', risk: 30, duration: 60, deadline: '2026-10-15', status: 'PENDING',
    description: 'Repair of damaged OFC between SRE and MZP.',
    safetyImpact: 'LOW'
  },
];

// ─── Block Windows ───────────────────────────────────────────

export const INITIAL_BLOCKS: BlockWindow[] = [
  {
    id: 'B-201', section: 'DDN-Haridwar', sectionId: 'DDN-HW', date: '2026-09-28',
    startTime: '09:00', endTime: '11:00', duration: 120, status: 'AVAILABLE',
    bundledTasks: [], approvalStatus: 'PENDING_REVIEW', approvedBy: null, trainConflicts: [], utilization: 0
  },
  {
    id: 'B-202', section: 'DDN-Haridwar', sectionId: 'DDN-HW', date: '2026-09-28',
    startTime: '11:30', endTime: '14:00', duration: 150, status: 'AVAILABLE',
    bundledTasks: [], approvalStatus: 'PENDING_REVIEW', approvedBy: null, trainConflicts: [], utilization: 0
  },
  {
    id: 'B-203', section: 'Haridwar-Roorkee', sectionId: 'HW-RK', date: '2026-09-28',
    startTime: '02:00', endTime: '05:00', duration: 180, status: 'AVAILABLE',
    bundledTasks: [], approvalStatus: 'PENDING_REVIEW', approvedBy: null, trainConflicts: [], utilization: 0
  },
  {
    id: 'B-204', section: 'Roorkee-Saharanpur', sectionId: 'RK-SRE', date: '2026-09-29',
    startTime: '09:00', endTime: '11:30', duration: 150, status: 'AVAILABLE',
    bundledTasks: [], approvalStatus: 'PENDING_REVIEW', approvedBy: null, trainConflicts: [], utilization: 0
  },
  {
    id: 'B-205', section: 'Roorkee-Saharanpur', sectionId: 'RK-SRE', date: '2026-09-29',
    startTime: '12:00', endTime: '14:00', duration: 120, status: 'AVAILABLE',
    bundledTasks: [], approvalStatus: 'PENDING_REVIEW', approvedBy: null, trainConflicts: [], utilization: 0
  },
  {
    id: 'B-206', section: 'Saharanpur-Delhi', sectionId: 'SRE-DLI', date: '2026-09-30',
    startTime: '01:00', endTime: '04:30', duration: 210, status: 'AVAILABLE',
    bundledTasks: [], approvalStatus: 'PENDING_REVIEW', approvedBy: null, trainConflicts: [], utilization: 0
  },
  {
    id: 'B-207', section: 'DDN-Haridwar', sectionId: 'DDN-HW', date: '2026-10-01',
    startTime: '10:00', endTime: '12:30', duration: 150, status: 'AVAILABLE',
    bundledTasks: [], approvalStatus: 'PENDING_REVIEW', approvedBy: null, trainConflicts: [], utilization: 0
  },
];

// ─── Block Requests ──────────────────────────────────────────

export const INITIAL_BLOCK_REQUESTS: BlockRequest[] = [
  { id: 'BR-001', department: 'Engineering', taskId: 'ENG-101', taskDescription: 'Track Inspection - DDN-Haridwar', section: 'DDN-Haridwar', requestedDate: '2026-09-28', startTime: '11:30', duration: 60, priority: 'HIGH', status: 'PENDING' },
  { id: 'BR-002', department: 'S&T', taskId: 'SNT-102', taskDescription: 'Signal S-204 Maintenance - DDN-Haridwar', section: 'DDN-Haridwar', requestedDate: '2026-09-28', startTime: '11:30', duration: 30, priority: 'MEDIUM', status: 'PENDING' },
  { id: 'BR-003', department: 'Traction', taskId: 'TRC-103', taskDescription: 'OHE Inspection - DDN-Haridwar', section: 'DDN-Haridwar', requestedDate: '2026-09-28', startTime: '12:00', duration: 45, priority: 'HIGH', status: 'PENDING' },
  { id: 'BR-004', department: 'Engineering', taskId: 'ENG-104', taskDescription: 'Sleeper Replacement - Haridwar-Roorkee', section: 'Haridwar-Roorkee', requestedDate: '2026-09-28', startTime: '02:00', duration: 120, priority: 'CRITICAL', status: 'PENDING' },
  { id: 'BR-005', department: 'S&T', taskId: 'SNT-105', taskDescription: 'Relay Room Inspection - Haridwar-Roorkee', section: 'Haridwar-Roorkee', requestedDate: '2026-09-28', startTime: '02:30', duration: 45, priority: 'HIGH', status: 'PENDING' },
  { id: 'BR-006', department: 'Engineering', taskId: 'ENG-107', taskDescription: 'Rail Joint Inspection - Roorkee-Saharanpur', section: 'Roorkee-Saharanpur', requestedDate: '2026-09-29', startTime: '09:00', duration: 60, priority: 'HIGH', status: 'PENDING' },
  { id: 'BR-007', department: 'S&T', taskId: 'SNT-108', taskDescription: 'Level Crossing Gate Repair - Roorkee-Saharanpur', section: 'Roorkee-Saharanpur', requestedDate: '2026-09-29', startTime: '09:30', duration: 40, priority: 'HIGH', status: 'PENDING' },
];

// ─── Default What-If Scenarios ───────────────────────────────

export const DEFAULT_SCENARIOS: WhatIfScenario[] = [
  {
    id: 'WI-01', name: 'Add Special Train', type: 'ADD_TRAIN',
    description: 'Add a special Rajdhani train through DDN-HW section at 11:45',
    applied: false, parameters: { trainNumber: '02055', section: 'DDN-HW', time: '11:45' }
  },
  {
    id: 'WI-02', name: 'Emergency Track Fracture', type: 'ADD_DEFECT',
    description: 'Critical rail fracture detected at KM 23 on DDN-HW section',
    applied: false, parameters: { severity: 'CRITICAL', section: 'DDN-HW', risk: 99, duration: 90 }
  },
  {
    id: 'WI-03', name: 'Extend Sleeper Replacement', type: 'INCREASE_DURATION',
    description: 'Increase ENG-104 (Sleeper Replacement) duration from 120 to 160 min',
    applied: false, parameters: { taskId: 'ENG-104', newDuration: 160 }
  },
  {
    id: 'WI-04', name: 'Cancel Night Block', type: 'REMOVE_BLOCK',
    description: 'Remove block B-203 (HW-RK 02:00-05:00) due to goods traffic',
    applied: false, parameters: { blockId: 'B-203' }
  },
  {
    id: 'WI-05', name: 'Delay Jan Shatabdi', type: 'DELAY_TRAIN',
    description: 'Delay train 12055 by 45 minutes on DDN-HW section',
    applied: false, parameters: { trainNumber: '12055', section: 'DDN-HW', delayMinutes: 45 }
  },
];
