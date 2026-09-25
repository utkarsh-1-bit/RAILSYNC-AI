from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/schedules", tags=["Schedules"])


@router.get("/", response_model=List[schemas.ScheduleWithDetails])
def read_schedules(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    """Get all schedules with train and station details."""
    schedules = db.query(models.Schedule).offset(skip).limit(limit).all()
    results = []
    for s in schedules:
        results.append(schemas.ScheduleWithDetails(
            id=s.id,
            train_id=s.train_id,
            station_id=s.station_id,
            arrival_time=s.arrival_time,
            departure_time=s.departure_time,
            scheduled_arrival=s.scheduled_arrival,
            scheduled_departure=s.scheduled_departure,
            sequence_number=s.sequence_number,
            platform=s.platform,
            delay_minutes=s.delay_minutes,
            day=s.day,
            train_number=s.train.number if s.train else None,
            train_name=s.train.name if s.train else None,
            station_code=s.station.code if s.station else None,
            station_name=s.station.name if s.station else None,
        ))
    return results


@router.get("/train/{train_id}", response_model=List[schemas.ScheduleWithDetails])
def read_train_schedules(train_id: int, db: Session = Depends(get_db)):
    """Get schedules for a specific train."""
    schedules = db.query(models.Schedule).filter(
        models.Schedule.train_id == train_id
    ).order_by(models.Schedule.sequence_number).all()
    results = []
    for s in schedules:
        results.append(schemas.ScheduleWithDetails(
            id=s.id,
            train_id=s.train_id,
            station_id=s.station_id,
            arrival_time=s.arrival_time,
            departure_time=s.departure_time,
            scheduled_arrival=s.scheduled_arrival,
            scheduled_departure=s.scheduled_departure,
            sequence_number=s.sequence_number,
            platform=s.platform,
            delay_minutes=s.delay_minutes,
            day=s.day,
            train_number=s.train.number if s.train else None,
            train_name=s.train.name if s.train else None,
            station_code=s.station.code if s.station else None,
            station_name=s.station.name if s.station else None,
        ))
    return results


@router.get("/station/{station_id}", response_model=List[schemas.ScheduleWithDetails])
def read_station_schedules(station_id: int, db: Session = Depends(get_db)):
    """Get schedules at a specific station."""
    schedules = db.query(models.Schedule).filter(
        models.Schedule.station_id == station_id
    ).order_by(models.Schedule.arrival_time).all()
    results = []
    for s in schedules:
        results.append(schemas.ScheduleWithDetails(
            id=s.id,
            train_id=s.train_id,
            station_id=s.station_id,
            arrival_time=s.arrival_time,
            departure_time=s.departure_time,
            scheduled_arrival=s.scheduled_arrival,
            scheduled_departure=s.scheduled_departure,
            sequence_number=s.sequence_number,
            platform=s.platform,
            delay_minutes=s.delay_minutes,
            day=s.day,
            train_number=s.train.number if s.train else None,
            train_name=s.train.name if s.train else None,
            station_code=s.station.code if s.station else None,
            station_name=s.station.name if s.station else None,
        ))
    return results
