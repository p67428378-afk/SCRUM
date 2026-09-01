import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from server.database import init_db, seed_data, get_db, engine
from server.schemas import HealthStatus
from server.routers import patients, records, appointments, doctors


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Ensure tables are created
    init_db()
    # Seed initial sample data idempotently
    with Session(engine) as db:
        seed_data(db)
    yield


app = FastAPI(
    title="CarePulse EHR - Patient Management System API",
    description="REST API for Patient Registration, Medical Records Management, and Appointment Scheduling.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS Middleware
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
)
ALLOWED_ORIGINS = [
    origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(patients.router)
app.include_router(records.router)
app.include_router(appointments.router)
app.include_router(doctors.router)


@app.get("/health", response_model=HealthStatus, tags=["Health"])
@app.get("/api/v1/health", response_model=HealthStatus, tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint confirming service and database connectivity."""
    db.execute(text("SELECT 1"))
    return {"status": "healthy", "database": "connected"}


@app.get("/", tags=["Root"])
def root():
    """Root endpoint providing system summary."""
    return {
        "service": "Patient Management System API",
        "version": "1.0.0",
        "documentation": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
