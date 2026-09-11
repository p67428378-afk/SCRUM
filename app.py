"""FastAPI Application and Cloud Run entrypoint with Auto-Boot ETL Hook."""

from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging
import os
import threading
from typing import Any, Dict, Optional

from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

from pipeline.run_retail_orders_etl import RetailOrdersETLPipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("app")

# Global in-memory state for tracking execution status
APP_STATE: Dict[str, Any] = {
    "status": "STARTING",
    "last_run": None,
    "last_run_timestamp": None,
    "is_running": False,
    "total_runs": 0,
}

_state_lock = threading.Lock()


def execute_etl_task(execution_date: Optional[str] = None) -> Dict[str, Any]:
    """Execute the Retail Orders ETL pipeline and update state."""
    with _state_lock:
        if APP_STATE["is_running"]:
            logger.warning("ETL execution already in progress.")
            return {"status": "SKIPPED", "message": "Job already in progress"}
        APP_STATE["is_running"] = True
        APP_STATE["status"] = "RUNNING"

    try:
        pipeline = RetailOrdersETLPipeline()
        result = pipeline.run(execution_date=execution_date)
        with _state_lock:
            APP_STATE["last_run"] = result
            APP_STATE["last_run_timestamp"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            APP_STATE["status"] = "IDLE"
            APP_STATE["total_runs"] += 1
        return result
    except Exception as e:
        logger.error("Error executing ETL task: %s", e, exc_info=True)
        with _state_lock:
            APP_STATE["status"] = "ERROR"
            APP_STATE["last_run"] = {"status": "ERROR", "error": str(e)}
        return {"status": "ERROR", "error": str(e)}
    finally:
        with _state_lock:
            APP_STATE["is_running"] = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager that starts the auto-boot ETL worker in background thread."""
    # Skip auto-boot worker thread during pytest test runs
    is_testing = os.getenv("TESTING", "").lower() == "true" or "PYTEST_CURRENT_TEST" in os.environ
    if not is_testing:
        logger.info("Starting Retail Orders ETL service. Launching Auto-Boot background ETL task...")
        auto_boot_thread = threading.Thread(
            target=execute_etl_task,
            name="AutoBootETLWorker",
            daemon=True,
        )
        auto_boot_thread.start()
    else:
        APP_STATE["status"] = "IDLE"

    yield
    logger.info("Shutting down Retail Orders ETL service.")


app = FastAPI(
    title="Retail Orders ETL Service",
    version="1.0.0",
    description="Daily batch ETL service for ingesting, normalizing, deduplicating, and loading retail orders into BigQuery.",
    lifespan=lifespan,
)


class TriggerRequest(BaseModel):
    execution_date: Optional[str] = None
    force_sync: bool = False


@app.get("/")
def root():
    """Root status endpoint."""
    return {
        "service": "Retail Orders ETL Service",
        "version": "1.0.0",
        "status": APP_STATE["status"],
        "is_running": APP_STATE["is_running"],
        "total_runs": APP_STATE["total_runs"],
        "last_run": APP_STATE["last_run"],
    }


@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    """Liveness probe endpoint."""
    return {"status": "HEALTHY", "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}


@app.get("/status")
@app.get("/api/v1/status")
def pipeline_status():
    """Get the current pipeline status and last run execution metrics."""
    return {
        "status": APP_STATE["status"],
        "is_running": APP_STATE["is_running"],
        "total_runs": APP_STATE["total_runs"],
        "last_run_timestamp": APP_STATE["last_run_timestamp"],
        "last_run": APP_STATE["last_run"],
    }


@app.post("/api/v1/trigger")
@app.post("/api/v1/etl/run")
def trigger_etl(req: Optional[TriggerRequest] = None, background_tasks: BackgroundTasks = None):
    """Trigger the ETL pipeline on-demand."""
    if APP_STATE["is_running"]:
        return {
            "status": "RUNNING",
            "message": "ETL job is already running.",
            "is_running": True,
        }

    exec_date = req.execution_date if req else None
    if req and req.force_sync:
        # Run synchronously
        res = execute_etl_task(execution_date=exec_date)
        return {"status": "COMPLETED", "result": res}

    # Run in background
    if background_tasks:
        background_tasks.add_task(execute_etl_task, exec_date)
    else:
        threading.Thread(target=execute_etl_task, args=(exec_date,), daemon=True).start()

    return {
        "status": "TRIGGERED",
        "message": "Retail orders ETL batch run started in background.",
        "execution_date": exec_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
