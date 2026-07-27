from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from server.config import settings
from server.database import engine, Base, SessionLocal, seed_data
from server.routers import auth, accounts, profile, transfers, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    # Seed data
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Apex Bank API",
    description="Secure, scalable, and regulatorily compliant online banking platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
ALLOWED_ORIGINS = settings.ALLOWED_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(profile.router)
app.include_router(transfers.router)
app.include_router(admin.router)


@app.get("/health", response_model=dict)
def health_check():
    # Simulate system health and performance monitoring
    db_status = "connected"
    try:
        from sqlalchemy import text

        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy",
        "database": db_status,
        "system_metrics": {
            "cpu_usage_percent": 12.5,
            "memory_usage_percent": 45.2,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }
