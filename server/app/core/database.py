import os
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

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


def init_db():
    from server.app.models.account import Account  # noqa: F401
    from server.app.models.transfer import Transfer  # noqa: F401
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.app.models.account import Account

    seed_accounts = [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "account_number": "ACC-550E8400",
            "balance": Decimal("12450.00"),
            "currency": "USD",
        },
        {
            "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            "account_number": "ACC-6BA7B810",
            "balance": Decimal("1000.00"),
            "currency": "USD",
        },
    ]

    for acc_data in seed_accounts:
        existing = db.query(Account).filter(Account.id == acc_data["id"]).first()
        if not existing:
            account = Account(
                id=acc_data["id"],
                account_number=acc_data["account_number"],
                balance=acc_data["balance"],
                currency=acc_data["currency"],
            )
            db.add(account)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()
