import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.app.database import init_db, seed_data, SessionLocal
from server.app.api.v1 import v1_router
from server.app.api.v1.health_router import health_check, readiness_check


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database tables and seed initial data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="City Management System API",
    description="Centralized API for managing city zones, utility metrics, service requests, and citizen records.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(v1_router)

# Top-level health probe aliases
app.add_api_route("/health", health_check, methods=["GET"], tags=["Health"])
app.add_api_route("/ready", readiness_check, methods=["GET"], tags=["Health"])


@app.get("/")
def root():
    return {
        "message": "Welcome to City Management System API",
        "docs": "/docs",
        "health": "/health",
    }
