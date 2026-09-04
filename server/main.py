from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.config import settings
from server.database import init_db
from server.routers import auth, movies, series, search, watchlist, history


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed accounts
    init_db()
    yield


app = FastAPI(
    title="FlixFlow API",
    description="Movie and Series Management System API",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
allowed_origins = [
    origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(series.router)
app.include_router(search.router)
app.include_router(watchlist.router)
app.include_router(history.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to FlixFlow API"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "flixflow-backend"}
