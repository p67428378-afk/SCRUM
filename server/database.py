import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/app.db")

connect_args = {}
engine_kwargs = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    if ":memory:" in DATABASE_URL or os.getenv("TESTING", "").lower() == "true":
        engine_kwargs["poolclass"] = StaticPool

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_data(db: Session):
    # Import models locally to ensure registration
    from server.models.account import Account

    seed_accounts = [
        {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "account_number": "ACC-1001",
            "balance": 50000.00,
            "owner_name": "Apex Test Sender",
            "email": "test@example.com",
        },
        {
            "id": "987f6543-e89b-12d3-a456-426614174000",
            "account_number": "ACC-2002",
            "balance": 1000.00,
            "owner_name": "Apex Test Receiver",
            "email": "receiver@example.com",
        },
        {
            "id": "222e4567-e89b-12d3-a456-426614174000",
            "account_number": "ACC-3003",
            "balance": 100.00,
            "owner_name": "Low Balance Account",
            "email": "lowbalance@example.com",
        },
        {
            "id": "333e4567-e89b-12d3-a456-426614174000",
            "account_number": "ACC-ADMIN",
            "balance": 100000.00,
            "owner_name": "Admin Account",
            "email": "admin@example.com",
        },
    ]

    for acc_info in seed_accounts:
        existing = db.query(Account).filter(Account.id == acc_info["id"]).first()
        if not existing:
            try:
                acc = Account(
                    id=acc_info["id"],
                    account_number=acc_info["account_number"],
                    balance=acc_info["balance"],
                    owner_name=acc_info["owner_name"],
                    email=acc_info["email"],
                )
                db.add(acc)
                db.commit()
            except Exception:
                db.rollback()


def init_db():
    import server.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_data(db)
