import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {}
engine_kwargs = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    if ":memory:" in DATABASE_URL or os.getenv("TESTING", "").lower() == "true":
        engine_kwargs["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, connect_args=connect_args, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from server.models.account import Account  # noqa: F401
    from server.models.transfer import Transfer  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server.models.account import Account

    seed_accounts = [
        {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "account_number": "ACC-1001",
            "owner_name": "Apex Test Sender",
            "email": "test@example.com",
            "balance": 50000.0,
        },
        {
            "id": "987f6543-e89b-12d3-a456-426614174000",
            "account_number": "ACC-2002",
            "owner_name": "Apex Test Receiver",
            "email": "receiver@example.com",
            "balance": 1000.0,
        },
        {
            "id": "222e4567-e89b-12d3-a456-426614174000",
            "account_number": "ACC-3003",
            "owner_name": "Low Balance Account",
            "email": "lowbalance@example.com",
            "balance": 100.0,
        },
    ]

    for acc_info in seed_accounts:
        existing = db.query(Account).filter(Account.id == acc_info["id"]).first()
        if not existing:
            account = Account(
                id=acc_info["id"],
                account_number=acc_info["account_number"],
                owner_name=acc_info["owner_name"],
                email=acc_info["email"],
                balance=acc_info["balance"],
            )
            db.add(account)
    try:
        db.commit()
    except Exception:
        db.rollback()
