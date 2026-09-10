import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db
from server.routers import kpi, scenarios, skus, submissions


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database and seed benchmark data
    init_db()
    yield


app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Decision-support API for Dollar General Small Town Value Cluster Snacks assortment optimization",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(kpi.router)
app.include_router(skus.router)
app.include_router(scenarios.router)
app.include_router(submissions.router)


@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "DG Cluster Assortment Advisor API",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {"status": "ok"}
