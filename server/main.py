from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.config import settings
from server.database import init_db, seed_data, SessionLocal
from server.routers import auth, designs, media, boards, leads


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed default accounts & concepts
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield
    # Shutdown logic if any


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Cafe Interior Designer Ideas Portal",
    version="1.0.0",
    lifespan=lifespan,
)

# Mandatory CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(designs.router, prefix=settings.API_V1_STR)
app.include_router(media.router, prefix=settings.API_V1_STR)
app.include_router(boards.router, prefix=settings.API_V1_STR)
app.include_router(leads.router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME, "version": "1.0.0"}


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to the Cafe Interior Designer Ideas Portal API",
        "docs_url": "/docs",
        "health": "/health",
    }
