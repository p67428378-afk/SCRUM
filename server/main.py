import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from server.database import init_db, seed_data, SessionLocal, get_db
from server.api.routes.auth import router as auth_router
from server.api.routes.movies import router as movies_router
from server.api.routes.series import router as series_router
from server.api.routes.genres import router as genres_router
from server.services.catalog import get_catalog_stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup DB initialization & seeding
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Movies and Series Management System (Prime Video Clone)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Setup
ALLOWED_ORIGINS_STR = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
ALLOWED_ORIGINS = [
    origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1
app.include_router(auth_router, prefix="/api/v1")
app.include_router(movies_router, prefix="/api/v1")
app.include_router(series_router, prefix="/api/v1")
app.include_router(genres_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Welcome to Movies and Series Management System API",
        "docs": "/docs",
    }


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/v1/catalog/stats")
def catalog_stats(db: Session = Depends(get_db)):
    return get_catalog_stats(db)
