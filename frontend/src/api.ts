const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Types
export type Station = {
  id: number;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  platform_count: number;
  zone: string;
  is_junction: boolean;
};

export type Train = {
  id: number;
  number: string;
  name: string;
  train_type: string;
  capacity: number;
  max_speed_kmph: number;
  priority: number;
  status: string;
};

export type ScheduleEntry = {
  id: number;
  train_id: number;
  station_id: number;
  arrival_time: string | null;
  departure_time: string | null;
  scheduled_arrival: string | null;
  scheduled_departure: string | null;
  sequence_number: number;
  platform: number | null;
  delay_minutes: number;
  day: number;
  train_number: string | null;
  train_name: string | null;
  station_code: string | null;
  station_name: string | null;
};

export type DashboardStats = {
  total_trains: number;
  total_stations: number;
  active_schedules: number;
  avg_delay_minutes: number;
  on_time_percentage: number;
  trains_by_status: Record<string, number>;
  trains_by_type: Record<string, number>;
  recent_optimizations: OptimizationRun[];
};

export type NetworkNode = {
  id: number;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  is_junction: boolean;
};

export type NetworkEdge = {
  from_id: number;
  to_id: number;
  from_code: string;
  to_code: string;
  distance_km: number;
  train_count: number;
};

export type NetworkGraph = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
};

export type OptimizationRun = {
  id: number;
  scenario_name: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  total_delay_before: number | null;
  total_delay_after: number | null;
  trains_rescheduled: number;
  conflicts_resolved: number;
};

export type OptimizationResult = {
  status: string;
  optimization_id: number;
  scenario: string;
  compute_time_ms: number;
  metrics: {
    total_delay_before_min: number;
    total_delay_after_min: number;
    delay_reduction_pct: number;
    conflicts_found: number;
    conflicts_resolved: number;
    trains_rescheduled: number;
  };
  reassignments: Array<{
    station: string;
    old_platform: number;
    new_platform: number;
    trains_affected: string[];
  }>;
};
