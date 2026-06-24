"""
Module: server.app.database
Purpose: Database connection and session management.
Author: Backend Developer Agent
Created: 2026-06-24
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
from server.app.config import settings

# Determine if we are using SQLite (e.g. for testing)
is_sqlite = "sqlite" in settings.DATABASE_URL

connect_args = {"check_same_thread": False} if is_sqlite else {}

# Use StaticPool for SQLite to support multi-threaded testing
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    poolclass=StaticPool if is_sqlite else None,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependency to get a database session.
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
