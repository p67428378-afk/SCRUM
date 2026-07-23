import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from server.database import Base, engine, SessionLocal, seed_data
from server.api.v1.endpoints.assortment import router as assortment_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    # Seed initial data
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="API for Dollar General category managers to optimize product assortments.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
allowed_origins_str = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
allowed_origins = [
    origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str


@app.get("/", response_model=HealthResponse, status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "healthy"}


# Include Routers
app.include_router(assortment_router, prefix="/api/v1/assortment", tags=["Assortment"])
