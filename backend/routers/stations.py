from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("/", response_model=List[schemas.StationResponse])
def read_stations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    stations = db.query(models.Station).offset(skip).limit(limit).all()
    return stations

@router.post("/", response_model=schemas.StationResponse)
def create_station(station: schemas.StationCreate, db: Session = Depends(get_db)):
    db_station = db.query(models.Station).filter(models.Station.code == station.code).first()
    if db_station:
        raise HTTPException(status_code=400, detail="Station code already registered")
    
    new_station = models.Station(**station.model_dump())
    db.add(new_station)
    db.commit()
    db.refresh(new_station)
    return new_station

@router.get("/{station_id}", response_model=schemas.StationResponse)
def read_station(station_id: int, db: Session = Depends(get_db)):
    db_station = db.query(models.Station).filter(models.Station.id == station_id).first()
    if db_station is None:
        raise HTTPException(status_code=404, detail="Station not found")
    return db_station
