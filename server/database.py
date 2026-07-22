from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from server.config import settings

# For SQLite, we use connect_args={"check_same_thread": False}
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize the database schema."""
    # Import models here to ensure they are registered on Base.metadata
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    """Seed initial data if needed. Idempotent."""
    # Since we only have export_jobs table, we can seed some mock history
    # to match the workspec's GET /api/v1/exports/status response example.
    from server.models import ExportJob
    from datetime import datetime, timedelta, timezone
    import uuid

    # Check if we already have jobs
    if db.query(ExportJob).count() > 0:
        return

    # Seed some mock jobs
    now = datetime.now(timezone.utc)

    # Job 1: Success 1 day ago
    job1 = ExportJob(
        id=str(uuid.uuid4()),
        started_at=now - timedelta(days=1, hours=1),
        completed_at=now - timedelta(days=1, hours=1, minutes=-5),
        status="SUCCESS",
        exported_file_name=f"audit_log_{(now - timedelta(days=1)).strftime('%Y-%m-%d')}.csv.enc",
        exported_file_size_bytes=5662310,  # ~5.4 MB
        details="Uploaded successfully.",
        created_at=now - timedelta(days=1, hours=1),
        updated_at=now - timedelta(days=1, hours=1),
    )

    # Job 2: Failed 2 days ago
    job2 = ExportJob(
        id=str(uuid.uuid4()),
        started_at=now - timedelta(days=2, hours=1),
        completed_at=now - timedelta(days=2, hours=1, minutes=-4),
        status="FAILED",
        exported_file_name=None,
        exported_file_size_bytes=None,
        details="Failed to connect to GCS bucket.",
        created_at=now - timedelta(days=2, hours=1),
        updated_at=now - timedelta(days=2, hours=1),
    )

    db.add(job1)
    db.add(job2)
    try:
        db.commit()
    except Exception:
        db.rollback()
