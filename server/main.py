import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db
from server.api.routes import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema and seed initial data
    init_db()
    yield


app = FastAPI(
    title="Movies and Series Management API",
    description="Prime Video Clone backend service for managing and discovering movies, TV series, seasons, and episodes.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS Middleware
allowed_origins_raw = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
allowed_origins = [
    origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Welcome to Movies and Series Management API",
        "docs_url": "/docs",
        "health_check": "/api/v1/health",
    }


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "service": "movies-series-api"}
