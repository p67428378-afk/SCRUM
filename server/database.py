import logging
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("server.database")

DATABASE_URL = os.getenv("DATABASE_URL")


def _init_engine():
    global DATABASE_URL
    if not DATABASE_URL:
        DATABASE_URL = "sqlite:///./sales_dev.db"

    connect_args = {}
    if DATABASE_URL.startswith("sqlite"):
        connect_args = {"check_same_thread": False}

    try:
        return create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
    except Exception as exc:
        logger.warning(
            "Failed to initialize database engine with URL '%s' (%s). Falling back to SQLite.",
            DATABASE_URL,
            exc,
        )
        return create_engine("sqlite:///./sales_dev.db", connect_args={"check_same_thread": False})


engine = _init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Yield a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
