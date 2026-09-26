/* ═══════════════════════════════════════════════════════════════
   RAILSYNC AI — Synthetic Schedule Data
   Station-level schedule entries for the Timetable page
   ═══════════════════════════════════════════════════════════════
   Converts the corridor-level TIMETABLE from railwayData.ts into
   station-stop-level rows the SchedulesPage component expects.
   ═══════════════════════════════════════════════════════════════ */

import { TRAINS, TIMETABLE, STATIONS } from './railwayData';

export interface ScheduleEntry {
  id: number;
  train_id: string;
  station_id: number;
  arrival_time: string | null;
  departure_time: string | null;
  scheduled_arrival: string | null;
  scheduled_departure: string | null;
  sequence_number: number;
  platform: number | null;
  delay_minutes: number;
  day: number;
  train_number: string;
  train_name: string;
  station_code: string;
  station_name: string;
}

export interface TrainFlat {
  id: string;
  number: string;
  name: string;
  train_type: string;
  capacity: number;
  max_speed_kmph: number;
  priority: number;
  status: string;
}

/**
 * Build station-level schedule rows from the corridor timetable.
 * For each TimetableEntry we emit two stops (origin → destination).
 */
function buildSchedules(): ScheduleEntry[] {
  const entries: ScheduleEntry[] = [];
  let id = 1;
  let seq = 1;
  let lastTrainId = '';

  // Sort timetable by trainId then by departure time
  const sorted = [...TIMETABLE].sort((a, b) => {
    if (a.trainId !== b.trainId) return a.trainId.localeCompare(b.trainId);
    return a.departure.localeCompare(b.departure);
  });

  for (const tt of sorted) {
    if (tt.trainId !== lastTrainId) {
      seq = 1;
      lastTrainId = tt.trainId;
    }

    const originStation = STATIONS.find(s => s.code === tt.origin);
    const destStation = STATIONS.find(s => s.code === tt.destination);
    const train = TRAINS.find(t => t.id === tt.trainId);
    if (!train) continue;

    // Origin stop (departure)
    if (originStation) {
      entries.push({
        id: id++,
        train_id: tt.trainId,
        station_id: originStation.id,
        arrival_time: seq === 1 ? null : toISO(tt.arrival, tt.day),
        departure_time: toISO(tt.departure, tt.day),
        scheduled_arrival: seq === 1 ? null : toISO(tt.arrival, tt.day),
        scheduled_departure: toISO(tt.departure, tt.day),
        sequence_number: seq++,
        platform: assignPlatform(originStation.id, seq),
        delay_minutes: tt.delayMinutes,
        day: tt.day,
        train_number: tt.trainNumber,
        train_name: tt.trainName,
        station_code: originStation.code,
        station_name: originStation.name,
      });
    }

    // Destination stop (arrival)
    if (destStation) {
      // Estimate arrival at destination as departure + section travel time
      const arrivalAtDest = addMinutes(tt.departure, estimateTravelMinutes(tt.section));
      entries.push({
        id: id++,
        train_id: tt.trainId,
        station_id: destStation.id,
        arrival_time: toISO(arrivalAtDest, tt.day),
        departure_time: null, // pass-through or terminal
        scheduled_arrival: toISO(arrivalAtDest, tt.day),
        scheduled_departure: null,
        sequence_number: seq++,
        platform: assignPlatform(destStation.id, seq),
        delay_minutes: tt.delayMinutes,
        day: tt.day,
        train_number: tt.trainNumber,
        train_name: tt.trainName,
        station_code: destStation.code,
        station_name: destStation.name,
      });
    }
  }

  return entries;
}

function toISO(time: string, day: number): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(2026, 8, 27 + day); // September 28 for day 1
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function estimateTravelMinutes(section: string): number {
  const times: Record<string, number> = {
    'DDN-HW': 40,
    'HW-RK': 25,
    'RK-SRE': 45,
    'SRE-DLI': 90,
    'HW-LKU': 20,
  };
  return times[section] ?? 30;
}

function assignPlatform(stationId: number, seq: number): number {
  // Deterministic platform assignment based on station + sequence
  const station = STATIONS.find(s => s.id === stationId);
  const platforms = station?.platformCount ?? 4;
  return ((stationId * 3 + seq * 7) % platforms) + 1;
}

/**
 * Convert TRAINS to the flat API format the TrainsPage/SchedulesPage expects.
 */
export function getTrainsFlat(): TrainFlat[] {
  return TRAINS.map(t => ({
    id: t.id,
    number: t.number,
    name: t.name,
    train_type: t.type,
    capacity: t.capacity,
    max_speed_kmph: t.maxSpeed,
    priority: t.priority,
    status: t.status,
  }));
}

/**
 * Convert STATIONS to the flat API format the StationsPage expects.
 */
export function getStationsFlat() {
  return STATIONS.map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    latitude: s.latitude,
    longitude: s.longitude,
    platform_count: s.platformCount,
    zone: s.zone,
    is_junction: s.isJunction,
  }));
}

export const SCHEDULE_ENTRIES = buildSchedules();
