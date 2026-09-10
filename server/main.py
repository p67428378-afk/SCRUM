import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db
from server.routers.transfers import router as transfers_router
from server.routers.accounts import router as accounts_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema and baseline seeded accounts
    init_db()
    yield


app = FastAPI(
    title="Secure Peer-to-Peer (P2P) Money Transfer API",
    description="FastAPI service enabling real-time P2P transfers with synchronous fraud detection and balance verification.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware configuration
raw_allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
)
allowed_origins = [
    origin.strip() for origin in raw_allowed_origins.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "p2p-transfers-api"}


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Secure Peer-to-Peer (P2P) Money Transfer API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


# Include API routers under /api/v1
app.include_router(transfers_router, prefix="/api/v1")
app.include_router(accounts_router, prefix="/api/v1")
