import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.api.v1 import api_v1_router
from server.database import SessionLocal, init_db, seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema and seed data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Secure Peer-to-Peer (P2P) Money Transfer API",
    description="FastAPI service for real-time P2P transfers with synchronous fraud detection and balance verification.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
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

app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/", response_model=dict, summary="Health check")
def health_check() -> dict:
    return {"status": "ok", "service": "P2P Money Transfer API"}
