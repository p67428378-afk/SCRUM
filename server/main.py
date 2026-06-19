"""
Module: main
Purpose: FastAPI application entry point.
Author: Backend Developer Agent
Created: 2026-06-19
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.database import engine, Base
from server.routers import weather, locations

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="SkyWatch Pro API",
    description="Backend API for the SkyWatch Pro Weather Application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Safe with wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(weather.router)
app.include_router(locations.router)

@app.get("/", response_model=dict)
def root():
    """Health check endpoint."""
    return {"status": "healthy", "service": "SkyWatch Pro API"}
