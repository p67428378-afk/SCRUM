import os
import logging
import threading
import time
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.config import settings
from server.database import init_db, seed_data, SessionLocal
from server.models import ExportJob, get_utc_now
from server.services.exporter import run_export_job
from server.routers.exports import router as exports_router

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("securelog.main")

# Flag to control the background scheduler thread
scheduler_running = True


def run_scheduler():
    """
    Background thread that checks every 60 seconds if it is 01:00 UTC.
    If so, it triggers the daily audit log export job.
    """
    logger.info("Background scheduler thread started.")
    while scheduler_running:
        try:
            now = datetime.now(timezone.utc)
            # Check if it's 01:00 UTC (hour 1, minute 0)
            if now.hour == 1 and now.minute == 0:
                logger.info("Scheduler: Triggering daily audit log export...")
                db = SessionLocal()
                try:
                    # Create a new job record
                    job_id = str(uuid.uuid4())
                    new_job = ExportJob(
                        id=job_id, status="IN_PROGRESS", started_at=get_utc_now()
                    )
                    db.add(new_job)
                    db.commit()

                    # Run the export job
                    run_export_job(db, job_id)
                except Exception as e:
                    logger.error(f"Scheduler failed to run export: {str(e)}")
                finally:
                    db.close()

                # Sleep for 70 seconds to avoid double triggering in the same minute
                time.sleep(70)
        except Exception as e:
            logger.error(f"Error in background scheduler loop: {str(e)}")

        time.sleep(10)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for database initialization, seeding, and background scheduler.
    """
    global scheduler_running

    logger.info("Initializing database schema...")
    init_db()

    logger.info("Seeding initial data...")
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()

    # Start the background scheduler thread
    scheduler_running = True
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()

    yield

    # Stop the background scheduler thread
    logger.info("Stopping background scheduler thread...")
    scheduler_running = False
    logger.info("Shutting down application...")


app = FastAPI(
    title="SecureLog Audit Log Export API",
    description="API for automated, encrypted daily exports of system audit logs to external GCS bucket.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware (MANDATORY for fullstack projects)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", settings.ALLOWED_ORIGINS).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(exports_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to SecureLog Audit Log Export API"}
