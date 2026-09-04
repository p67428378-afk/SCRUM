from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.config import settings
from server.database import init_db, seed_data, SessionLocal
from server.routers import books


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Books Management System API",
    version="1.0.0",
    description="Core Inventory & Search Service for Books Management",
    lifespan=lifespan,
)

allowed_origins = [
    origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "healthy"}
