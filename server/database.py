import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/app.db")

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(engine_instance=None):
    from server import models
    target_engine = engine_instance or engine
    Base.metadata.create_all(bind=target_engine)
    db = SessionLocal() if engine_instance is None else sessionmaker(bind=target_engine)()
    try:
        from server.services.seed import seed_all_data
        seed_all_data(db)
    finally:
        db.close()
