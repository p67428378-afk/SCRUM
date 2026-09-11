"""FastAPI application entrypoint for ETL pipeline."""
import os
import threading
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from server.database import get_db, engine
from server.models import Base, ETLMetricsResponse
from server.etl_pipeline import ETLPipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables in development / test environments if needed
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    auto_run = os.getenv("AUTO_RUN_ETL", "false").lower() in ("true", "1", "yes")
    if auto_run:
        logger.info("AUTO_RUN_ETL is enabled. Triggering background ETL run...")
        thread = threading.Thread(target=lambda: ETLPipeline().run(), daemon=True)
        thread.start()
    yield


app = FastAPI(
    title="PostgreSQL to BigQuery Sales ETL Pipeline API",
    description="Automated ETL service for sales orders data ingestion and filtering into BigQuery.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root():
    """Root endpoint."""
    return {
        "service": "PostgreSQL to BigQuery ETL API",
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/api/v1/etl/run", response_model=ETLMetricsResponse, tags=["ETL"])
def run_etl_pipeline(
    limit: int = Query(default=None, description="Optional limit of records to process"),
    db: Session = Depends(get_db),
):
    """
    Trigger the ETL pipeline to extract records from PostgreSQL raw_sales_orders,
    apply amount and email filters, and load valid records to BigQuery fct_sales_orders.
    """
    pipeline = ETLPipeline(db_session=db)
    result = pipeline.run(limit=limit)
    if result.status.startswith("FAILED"):
        raise HTTPException(status_code=500, detail=result.status)
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
