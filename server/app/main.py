"""
Module: server.app.main
Purpose: Main entry point for the FastAPI application.
Author: Backend Developer Agent
Created: 2026-06-24
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.app.database import engine, Base, SessionLocal
from server.app.models import User
from server.app.api.endpoints import router as api_router, hash_password


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager to handle startup and shutdown events.
    Creates database tables and seeds the default test user idempotently.
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Seed test user
    db = SessionLocal()
    try:
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            hashed_pw = hash_password("testpassword")
            new_user = User(
                email="test@example.com",
                hashed_password=hashed_pw,
                role="Category Manager",
            )
            db.add(new_user)
            db.commit()
    finally:
        db.close()

    yield


app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Backend service for the DG Cluster Assortment Advisor Dashboard.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration - allow_credentials=False with wildcard origins as per CORS RULE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router with prefix
app.include_router(api_router, prefix="/api/v1")


@app.get("/", response_model=dict)
def health_check():
    """
    Simple health check endpoint.
    """
    return {"status": "healthy", "service": "DG Cluster Assortment Advisor API"}
