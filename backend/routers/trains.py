from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/trains", tags=["Trains"])

@router.get("/", response_model=List[schemas.TrainResponse])
def read_trains(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    trains = db.query(models.Train).offset(skip).limit(limit).all()
    return trains

@router.post("/", response_model=schemas.TrainResponse)
def create_train(train: schemas.TrainCreate, db: Session = Depends(get_db)):
    db_train = db.query(models.Train).filter(models.Train.number == train.number).first()
    if db_train:
        raise HTTPException(status_code=400, detail="Train number already registered")
    
    new_train = models.Train(**train.model_dump())
    db.add(new_train)
    db.commit()
    db.refresh(new_train)
    return new_train

@router.get("/{train_id}", response_model=schemas.TrainResponse)
def read_train(train_id: int, db: Session = Depends(get_db)):
    db_train = db.query(models.Train).filter(models.Train.id == train_id).first()
    if db_train is None:
        raise HTTPException(status_code=404, detail="Train not found")
    return db_train
