from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.app.config import settings
from server.app.database import init_db, seed_data, SessionLocal
from server.app.auth.router import router as auth_router
from server.app.properties.router import router as properties_router
from server.app.favorites.router import router as favorites_router
from server.app.saved_searches.router import router as saved_searches_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed initial data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="House Finding System API",
    description="RESTful API for real estate search, filtering, detailed property view, and listing management",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware setup
ALLOWED_ORIGINS = settings.ALLOWED_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(properties_router)
app.include_router(favorites_router)
app.include_router(saved_searches_router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy", "service": "house-finding-backend"}


@app.get("/", tags=["health"])
def root():
    return {"message": "Welcome to House Finding System API", "docs": "/docs"}
