import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db, seed_data, SessionLocal
from server.routers import auth, books, members, loans, fines


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema and run idempotent seed
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Centralized Library Management System API",
    version="1.0.0",
    description="RESTful API for book catalog CRUD, member management, borrowing/returning workflows, and overdue fine management.",
    lifespan=lifespan,
)

# CORS Middleware configuration
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

# Include API Routers
app.include_router(auth.router)
app.include_router(books.router)
app.include_router(members.router)
app.include_router(loans.router)
app.include_router(fines.router)


@app.get("/")
def root():
    return {
        "service": "Centralized Library Management System API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
