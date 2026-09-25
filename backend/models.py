from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    platform_count = Column(Integer, default=3)
    zone = Column(String, default="NR")  # Railway zone
    is_junction = Column(Boolean, default=False)

    # Relationships
    schedules = relationship("Schedule", back_populates="station")

class Train(Base):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True)
    name = Column(String)
    train_type = Column(String)
    capacity = Column(Integer)
    max_speed_kmph = Column(Integer, default=130)
    priority = Column(Integer, default=3)  # 1=highest, 5=lowest
    status = Column(String, default="on_time")  # on_time, delayed, cancelled

    # Relationships
    schedules = relationship("Schedule", back_populates="train")

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"))
    station_id = Column(Integer, ForeignKey("stations.id"))
    arrival_time = Column(DateTime, nullable=True)
    departure_time = Column(DateTime, nullable=True)
    scheduled_arrival = Column(DateTime, nullable=True)
    scheduled_departure = Column(DateTime, nullable=True)
    sequence_number = Column(Integer)
    platform = Column(Integer, nullable=True)
    delay_minutes = Column(Integer, default=0)
    day = Column(Integer, default=1)  # Day 1, Day 2 for multi-day trains

    # Relationships
    train = relationship("Train", back_populates="schedules")
    station = relationship("Station", back_populates="schedules")

class RouteSegment(Base):
    __tablename__ = "route_segments"

    id = Column(Integer, primary_key=True, index=True)
    from_station_id = Column(Integer, ForeignKey("stations.id"))
    to_station_id = Column(Integer, ForeignKey("stations.id"))
    distance_km = Column(Float)
    typical_time_minutes = Column(Integer)
    track_type = Column(String, default="double")  # single, double, quadruple

    from_station = relationship("Station", foreign_keys=[from_station_id])
    to_station = relationship("Station", foreign_keys=[to_station_id])

class OptimizationRun(Base):
    __tablename__ = "optimization_runs"

    id = Column(Integer, primary_key=True, index=True)
    scenario_name = Column(String)
    status = Column(String, default="pending")  # pending, running, completed, failed
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    total_delay_before = Column(Float, nullable=True)
    total_delay_after = Column(Float, nullable=True)
    trains_rescheduled = Column(Integer, default=0)
    conflicts_resolved = Column(Integer, default=0)
    parameters = Column(Text, nullable=True)  # JSON string
    result_summary = Column(Text, nullable=True)  # JSON string
