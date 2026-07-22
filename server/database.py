from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from server.config import settings

# For SQLite, we need connect_args={"check_same_thread": False}
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
    # Import models here to ensure they are registered on Base.metadata
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models import Todo

    # Check if we already have todos
    if db.query(Todo).count() == 0:
        sample_todos = [
            Todo(
                title="Database Migration",
                description="Migrate production database to Cloud SQL PostgreSQL instance.",
                priority="High",
                due_date=None,
            ),
            Todo(
                title="API Integration",
                description="Integrate FastAPI backend endpoints with React frontend.",
                priority="High",
                due_date=None,
            ),
            Todo(
                title="Write Unit Tests",
                description="Write unit tests for the FastAPI CRUD endpoints using pytest.",
                priority="Medium",
                due_date=None,
            ),
            Todo(
                title="Update Documentation",
                description="Update the README and API documentation on Confluence.",
                priority="Low",
                due_date=None,
            ),
        ]
        db.add_all(sample_todos)
        db.commit()
