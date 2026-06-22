"""
Module: main
Purpose: FastAPI application entry point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from server.app.database import engine, Base
from server.app.routers import (
    resident,
    maintenance,
    payment,
    communication,
    facility,
    visitor,
)


class HealthCheckResponse(BaseModel):
    status: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="ResiEase API",
    description="Society Management System API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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


@app.get("/", response_model=HealthCheckResponse)
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}
