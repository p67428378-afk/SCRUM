import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db
from server.api.v1.transfers import router as v1_transfers_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed data idempotently on startup
    init_db()
    yield


app = FastAPI(
    title="P2P Money Transfer API",
    description="Secure Peer-to-Peer money transfer module with synchronous fraud detection",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(v1_transfers_router, prefix="/api/v1")


@app.get("/health", tags=["system"])
def health_check():
    return {"status": "ok", "service": "p2p-transfers-api"}
