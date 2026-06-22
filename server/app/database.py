"""
Module: database
Purpose: Database connection and session management
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./society.db")

# If SQLite is used, we need check_same_thread and potentially StaticPool
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

# Use StaticPool for in-memory SQLite to support multi-threading in tests
poolclass = None
if "sqlite:///:memory:" in DATABASE_URL or DATABASE_URL == "sqlite://":
    poolclass = StaticPool

engine = create_engine(DATABASE_URL, connect_args=connect_args, poolclass=poolclass)

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
