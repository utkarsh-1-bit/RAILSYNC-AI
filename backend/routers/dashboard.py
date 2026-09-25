from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get aggregated dashboard statistics."""
    total_trains = db.query(models.Train).count()
    total_stations = db.query(models.Station).count()
    active_schedules = db.query(models.Schedule).count()

    # Average delay
    avg_delay = db.query(func.avg(models.Schedule.delay_minutes)).scalar() or 0.0

    # On-time percentage
    total_scheds = db.query(models.Schedule).count()
    on_time_scheds = db.query(models.Schedule).filter(models.Schedule.delay_minutes <= 5).count()
    on_time_pct = (on_time_scheds / total_scheds * 100) if total_scheds > 0 else 100.0

    # Trains by status
    status_counts = {}
    for status, count in db.query(models.Train.status, func.count(models.Train.id)).group_by(models.Train.status).all():
        status_counts[status] = count

    # Trains by type
    type_counts = {}
    for ttype, count in db.query(models.Train.train_type, func.count(models.Train.id)).group_by(models.Train.train_type).all():
        type_counts[ttype] = count

    # Recent optimization runs
    recent_runs = db.query(models.OptimizationRun).order_by(
        models.OptimizationRun.id.desc()
    ).limit(5).all()

    return schemas.DashboardStats(
        total_trains=total_trains,
        total_stations=total_stations,
        active_schedules=active_schedules,
        avg_delay_minutes=round(avg_delay, 1),
        on_time_percentage=round(on_time_pct, 1),
        trains_by_status=status_counts,
        trains_by_type=type_counts,
        recent_optimizations=recent_runs
    )


@router.get("/network", response_model=schemas.NetworkGraph)
def get_network_graph(db: Session = Depends(get_db)):
    """Get network graph data for map visualization."""
    stations = db.query(models.Station).all()
    nodes = [
        schemas.NetworkNode(
            id=s.id, code=s.code, name=s.name,
            latitude=s.latitude, longitude=s.longitude,
            is_junction=s.is_junction
        )
        for s in stations
    ]

    segments = db.query(models.RouteSegment).all()
    station_map = {s.id: s for s in stations}
    edges = []
    for seg in segments:
        from_st = station_map.get(seg.from_station_id)
        to_st = station_map.get(seg.to_station_id)
        if from_st and to_st:
            edges.append(schemas.NetworkEdge(
                from_id=seg.from_station_id,
                to_id=seg.to_station_id,
                from_code=from_st.code,
                to_code=to_st.code,
                distance_km=seg.distance_km,
                train_count=0
            ))

    return schemas.NetworkGraph(nodes=nodes, edges=edges)
