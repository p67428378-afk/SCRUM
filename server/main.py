import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db, seed_data, SessionLocal
from server.routers import portfolio, concerts, tickets, payments


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize database schema
    init_db()
    # 2. Seed initial data
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Singer Portfolio & Multi-Country Concert Ticket Booking Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware (MANDATORY for fullstack projects)
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(portfolio.router)
app.include_router(concerts.router)
app.include_router(tickets.router)
app.include_router(payments.router)


@app.get("/health", response_model=dict)
def health_check():
    return {"status": "healthy"}
