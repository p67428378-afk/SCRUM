import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db, seed_data, SessionLocal
from server.routers import locations, weather, forecasts, alerts


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup DB initialization and seeding
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Weather Management System API",
    version="1.0.0",
    description="Real-time weather tracking, forecasting, and threshold-based automated alerts.",
    lifespan=lifespan,
)

# Mandatory CORS Middleware
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(locations.router)
app.include_router(weather.router)
app.include_router(forecasts.router)
app.include_router(alerts.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "weather-management-system"}


@app.get("/")
def root():
    return {
        "message": "Welcome to the Weather Management System API",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
