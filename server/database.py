from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
from server.config import settings

# If testing or using sqlite, configure connect_args
connect_args = {}
engine_kwargs = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    if settings.DATABASE_URL == "sqlite:///:memory:" or settings.TESTING:
        engine_kwargs["poolclass"] = StaticPool

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args, **engine_kwargs
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
