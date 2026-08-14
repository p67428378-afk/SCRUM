from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from server.app.config import settings

if settings.TESTING or settings.DATABASE_URL.startswith("sqlite"):
    # SQLite setup
    connect_args = {"check_same_thread": False}
    if settings.TESTING:
        engine = create_engine(
            "sqlite:///:memory:",
            connect_args=connect_args,
            poolclass=StaticPool,
        )
    else:
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args=connect_args,
        )
else:
    # PostgreSQL or other database setup
    engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
