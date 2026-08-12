"""
Module: main
Purpose: FastAPI application entry point
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from server.app.database import engine, Base, SessionLocal
from server.app.models import *  # Register all models on Base.metadata
from server.app.seed_data import seed_data
from server.app.routers import (
    resident,
    maintenance,
    payment,
    communication,
    facility,
    visitor,
    bus_tracking,
)


class HealthCheckResponse(BaseModel):
    status: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    Base.metadata.create_all(bind=engine)
    # Seed initial data idempotently
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Real-Time Bus Tracking API",
    description="Live transit geolocation, route schedules, ETAs, and admin fleet management API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
allowed_origins_str = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
allowed_origins = [
    origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resident.router)
app.include_router(maintenance.router)
app.include_router(payment.router)
app.include_router(communication.router)
app.include_router(facility.router)
app.include_router(visitor.router)
app.include_router(bus_tracking.router)


@app.get("/", response_model=HealthCheckResponse)
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}
