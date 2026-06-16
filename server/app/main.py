"""
Module: main
Purpose: FastAPI application entry point.
Author: Backend Developer Agent
Created: 2026-06-16
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.app.config import settings
from server.app.database import engine, Base
from server.app.routers import kyc


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up resources if any on shutdown


app = FastAPI(
    title="ApexBank KYC Onboarding API",
    description="Digital KYC Onboarding Microservice with Aadhaar/PAN validation, RBI/CIBIL screening, and full audit trail.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False if "*" in origins else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(kyc.router)


@app.get("/", response_model=dict, summary="Health Check")
def health_check():
    """
    Simple health check endpoint.
    """
    return {"status": "healthy", "service": "kyc-onboarding"}
