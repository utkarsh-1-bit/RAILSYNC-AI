from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine
import models
from routers import stations, trains, optimization, dashboard, schedules

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="RAILSYNC AI - Railway Optimization API"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(stations.router)
app.include_router(trains.router)
app.include_router(optimization.router)
app.include_router(dashboard.router)
app.include_router(schedules.router)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.APP_NAME} API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}

# Auto-seed in demo mode
@app.on_event("startup")
def startup_event():
    if settings.DEMO_MODE:
        from seed import seed_data
        seed_data()
