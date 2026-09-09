import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from server.database import init_db, seed_data, SessionLocal, get_db
from server.routers import auth, profile, media, credits, public


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: init DB and seed default test data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Actor Portfolio System API",
    description="RESTful API for managing actor profiles, media gallery, filmography credits, and public shareable links.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS Middleware (MANDATORY for fullstack)
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health Check Endpoint
@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    return {"status": "ok", "database": db_status}


# Include API Routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(media.router)
app.include_router(credits.router)
app.include_router(public.router)
