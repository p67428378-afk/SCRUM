from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from server.core.config import settings

# Determine database engine parameters
db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True if not db_url.startswith("sqlite") else False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency to provide a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables and seed static data idempotently."""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        from server.seed import seed_data

        seed_data(db)
    finally:
        db.close()
