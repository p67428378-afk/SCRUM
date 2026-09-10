import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data, SessionLocal
from server.routers import auth, dashboard, fields, livestock, equipment, inventory


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema and seed initial data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Farm Management System Core Operations API",
    version="1.0.0",
    description="Centralized REST API for managing crop cycles, livestock health, equipment maintenance, and input inventory.",
    lifespan=lifespan,
)

# Enable CORS for full-stack integration
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

# Register API Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(fields.router)
app.include_router(livestock.router)
app.include_router(equipment.router)
app.include_router(inventory.router)


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Farm Management System API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
