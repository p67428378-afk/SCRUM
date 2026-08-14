import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.database import init_db
from server.routers import auth, menu, orders


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database tables and seed default data
    init_db()
    yield


app = FastAPI(
    title="Bandra Hotel Food Delivery Portal API",
    description="Backend API for Bandra Hotel food ordering, menu management, and fulfillment tracking.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
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

# Include API Routers
app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(orders.router)


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Bandra Hotel Delivery API"}


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Bandra Hotel Food Delivery Portal API",
        "docs_url": "/docs",
        "health_url": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
