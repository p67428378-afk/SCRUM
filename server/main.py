import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data, SessionLocal
from server.routers import auth, books, loans


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed initial data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Library Management System API",
    description="API for Book Catalog, Patron Management, and Loan Circulation Workflows",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware for Full-Stack Frontend Integration
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

# Include Routers
app.include_router(auth.router)
app.include_router(books.router)
app.include_router(loans.router)


@app.get("/", tags=["health"])
def root():
    return {
        "status": "healthy",
        "service": "Library Management System API",
        "version": "1.0.0",
    }


@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "timestamp": "running",
    }
