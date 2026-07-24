from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from server.config import settings
from server.database import init_db, SessionLocal, seed_data
from server.routers import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database schema
    init_db()
    # Seed initial data
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Apex Retail Bank API",
    description="Secure, scalable, and regulatorily compliant online banking API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", settings.ALLOWED_ORIGINS).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "Welcome to Apex Retail Bank API"}
