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
    # Import models here to register them on Base.metadata
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models import User
    from server.auth import get_password_hash
    import uuid

    # Seed regular user
    # We use test@example.com as the username to match the "email: test@example.com" requirement
    username = "test@example.com"
    existing_user = db.query(User).filter(User.username == username).first()
    if not existing_user:
        hashed_pw = get_password_hash("testpassword")
        hashed_answer = get_password_hash("first pet")
        user = User(
            id=str(uuid.uuid4()),
            username=username,
            hashed_password=hashed_pw,
            customer_id="CUST-12345",
            phone_number="+15551234567",
            is_active=True,
            failed_login_attempts=0,
            security_question="What was the name of your first pet?",
            security_answer_hash=hashed_answer,
        )
        db.add(user)
        try:
            db.commit()
        except Exception:
            db.rollback()
