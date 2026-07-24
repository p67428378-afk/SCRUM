import os

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.config import settings
from server.database import SessionLocal, init_db, seed_data
from server.routers import auth, sessions

app = FastAPI(
    title="ApexSecure Bank API",
    description="Secure Customer Authentication and Session Management API",
    version="1.0.0",
)

# CORS Middleware
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", settings.ALLOWED_ORIGINS).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database initialization and seeding on startup
@app.on_event("startup")
def startup_event():
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


# Include routers
app.include_router(auth.router)
app.include_router(sessions.router)
from server.routers import admin, banking

app.include_router(banking.router)
app.include_router(admin.router)


@app.get("/health")
def health_check():
    return {"status": "healthy"}
