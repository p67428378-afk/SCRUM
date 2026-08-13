import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data, SessionLocal, engine
from server.routers import auth, rooms, guests, reservations, folios, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables and seed default users/data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield
    # Shutdown


app = FastAPI(
    title="Hotel Management System API",
    description="Core Booking, Room, Guest & Billing Operations API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware Setup
raw_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
allowed_origins = [
    origin.strip() for origin in raw_origins.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(guests.router)
app.include_router(reservations.router)
app.include_router(folios.router)
app.include_router(dashboard.router)


@app.get("/health", tags=["Health"])
def health_check():
    # Verify DB connection
    try:
        with engine.connect() as conn:
            conn.execute(auth.User.__table__.select().limit(1))
        db_status = "connected"
    except Exception:
        db_status = "error"

    return {"status": "ok", "database": db_status}
