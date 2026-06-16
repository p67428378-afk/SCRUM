"""
Module: database
Purpose: Database connection and session management.
Author: Backend Developer Agent
Created: 2026-06-16
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
from server.app.config import settings

# Determine database URL
DATABASE_URL = os.getenv("DATABASE_URL", settings.DATABASE_URL)

# SQLite specific arguments
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    poolclass = StaticPool
else:
    poolclass = None

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    poolclass=poolclass
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependency to get a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
