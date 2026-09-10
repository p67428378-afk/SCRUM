import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db
from server.api.v1 import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed data idempotently on startup
    init_db()
    yield


app = FastAPI(
    title="Secure Peer-to-Peer (P2P) Money Transfer API",
    version="1.0.0",
    description="Backend API for P2P money transfers with synchronous fraud and balance checks.",
    lifespan=lifespan,
)

# CORS configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "service": "p2p-money-transfer"}


@app.get("/", tags=["root"])
def root():
    return {
        "message": "Welcome to Secure P2P Money Transfer API",
        "docs_url": "/docs",
        "transfers_endpoint": "/api/v1/transfers",
    }
