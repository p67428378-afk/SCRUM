from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import os
from contextlib import asynccontextmanager

from server.database import init_db, seed_data, SessionLocal
from server.api.v1.endpoints import auth, payments


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
    title="ApexBank Recurring Payments API",
    description="API for managing recurring payments with split funding",
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
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])


@app.get("/")
def read_root():
    return {"message": "Welcome to ApexBank Recurring Payments API"}
