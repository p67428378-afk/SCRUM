import logging
import os
import threading
from contextlib import asynccontextmanager
from typing import Any, Dict, Optional
from fastapi import BackgroundTasks, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from server.database import Base, engine
from server.etl_pipeline import run_pipeline
from server.models import ETLMetricsResponse

logger = logging.getLogger("server.main")

# In-memory store for last ETL execution metrics
last_execution_metrics: Dict[str, Any] = {
    "status": "INITIALIZED",
    "message": "ETL pipeline ready"
}


def auto_boot_etl_worker():
    """Background task executed on container startup for Serverless Auto-Boot execution."""
    global last_execution_metrics
    auto_boot_enabled = os.getenv("AUTO_BOOT_ETL", "true").lower() == "true"
    if not auto_boot_enabled:
        logger.info("Auto-Boot ETL execution is disabled via AUTO_BOOT_ETL=false.")
        return

    logger.info("Auto-Boot ETL execution starting in background thread...")
    try:
        # Create database tables if not existing (e.g. SQLite test database)
        Base.metadata.create_all(bind=engine)
        metrics = run_pipeline()
        last_execution_metrics = metrics
        logger.info("Auto-Boot ETL execution completed successfully: %s", metrics)
    except Exception as exc:
        logger.error("Auto-Boot ETL background task failed: %s", exc, exc_info=True)
        last_execution_metrics = {
            "status": "FAILED",
            "error": str(exc)
        }


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context to trigger auto-boot ETL runner on startup."""
    thread = threading.Thread(target=auto_boot_etl_worker, daemon=True)
    thread.start()
    yield


app = FastAPI(
    title="PostgreSQL to BigQuery ETL Service",
    description="Automated serverless ETL pipeline to extract sales orders from PostgreSQL, filter invalid records, and load into BigQuery.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration compliant with Project Constitution
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [orig.strip() for orig in allowed_origins_raw.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TriggerETLRequest(BaseModel):
    limit: Optional[int] = None
    dry_run: bool = False


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "sales-etl-pipeline"}


@app.get("/", tags=["Root"])
def root():
    """Root endpoint."""
    return {
        "service": "sales-orders-etl-service",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/v1/etl/status", tags=["ETL Pipeline"])
def get_etl_status():
    """Retrieve the status and metrics of the latest ETL execution."""
    return last_execution_metrics


@app.post("/api/v1/etl/run", response_model=ETLMetricsResponse, tags=["ETL Pipeline"])
def trigger_etl_run(payload: Optional[TriggerETLRequest] = None):
    """Manually trigger an ETL run synchronously."""
    global last_execution_metrics
    req = payload or TriggerETLRequest()
    try:
        metrics = run_pipeline(limit=req.limit, dry_run=req.dry_run)
        last_execution_metrics = metrics
        return metrics
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ETL execution failed: {str(exc)}"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=False)
