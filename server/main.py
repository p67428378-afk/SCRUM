import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.database import init_db, seed_data, SessionLocal
from server.routes import auth, items, inventory


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database and seed data on startup
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Grocery Inventory and Stock Levels Management System",
    description="API for managing grocery items, stock levels, and manual adjustments with audit logs.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
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

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(items.router, prefix="/api/v1")
app.include_router(inventory.router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "healthy"}
