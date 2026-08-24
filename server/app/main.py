import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.app.database import init_db, seed_data, SessionLocal
from server.app.routers import auth, bookings, donations, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed test data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Shri Shivji Temple Management System API",
    description="Centralized digital management system for pooja/seva bookings, devotee profiles, donations, e-receipts, and admin operational dashboards.",
    version="1.0.0",
    lifespan=lifespan,
)

# Mandatory CORS setup for fullstack integration
allowed_origins_str = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
allowed_origins = [
    origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(bookings.router)
app.include_router(donations.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "system": "Shri Shivji Temple Management System",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
