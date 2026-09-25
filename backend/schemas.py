from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Station
class StationBase(BaseModel):
    code: str
    name: str
    latitude: float
    longitude: float
    platform_count: int = 3
    zone: str = "NR"
    is_junction: bool = False

class StationCreate(StationBase):
    pass

class StationResponse(StationBase):
    id: int

    class Config:
        from_attributes = True

# Train
class TrainBase(BaseModel):
    number: str
    name: str
    train_type: str
    capacity: int
    max_speed_kmph: int = 130
    priority: int = 3
    status: str = "on_time"

class TrainCreate(TrainBase):
    pass

class TrainResponse(TrainBase):
    id: int

    class Config:
        from_attributes = True

# Schedule
class ScheduleBase(BaseModel):
    train_id: int
    station_id: int
    arrival_time: Optional[datetime] = None
    departure_time: Optional[datetime] = None
    scheduled_arrival: Optional[datetime] = None
    scheduled_departure: Optional[datetime] = None
    sequence_number: int
    platform: Optional[int] = None
    delay_minutes: int = 0
    day: int = 1

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleResponse(ScheduleBase):
    id: int
    
    class Config:
        from_attributes = True

class ScheduleWithDetails(ScheduleResponse):
    train_number: Optional[str] = None
    train_name: Optional[str] = None
    station_code: Optional[str] = None
    station_name: Optional[str] = None

# Route Segment
class RouteSegmentBase(BaseModel):
    from_station_id: int
    to_station_id: int
    distance_km: float
    typical_time_minutes: int
    track_type: str = "double"

class RouteSegmentResponse(RouteSegmentBase):
    id: int
    
    class Config:
        from_attributes = True

# Optimization
class OptimizationRequest(BaseModel):
    scenario_name: str = "default"
    parameters: Dict[str, Any] = {}

class OptimizationRunResponse(BaseModel):
    id: int
    scenario_name: str
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_delay_before: Optional[float] = None
    total_delay_after: Optional[float] = None
    trains_rescheduled: int = 0
    conflicts_resolved: int = 0

    class Config:
        from_attributes = True

# Dashboard Analytics
class DashboardStats(BaseModel):
    total_trains: int
    total_stations: int
    active_schedules: int
    avg_delay_minutes: float
    on_time_percentage: float
    trains_by_status: Dict[str, int]
    trains_by_type: Dict[str, int]
    recent_optimizations: List[OptimizationRunResponse]

# Network graph data for map visualization
class NetworkNode(BaseModel):
    id: int
    code: str
    name: str
    latitude: float
    longitude: float
    is_junction: bool

class NetworkEdge(BaseModel):
    from_id: int
    to_id: int
    from_code: str
    to_code: str
    distance_km: float
    train_count: int = 0

class NetworkGraph(BaseModel):
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]
