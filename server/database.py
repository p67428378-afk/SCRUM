import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import create_engine, TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(36), storing as stringified hex values.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return str(value)
        else:
            if isinstance(value, uuid.UUID):
                return str(value)
            else:
                return str(uuid.UUID(str(value)))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if isinstance(value, uuid.UUID):
                return value
            return uuid.UUID(str(value))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from server.models import transfer, account  # noqa: F401
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


def seed_data(db: Session):
    from server.models.account import Account

    seed_accounts = [
        {
            "id": uuid.UUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"),
            "account_name": "Premier Checking (•••• 8492)",
            "balance": Decimal("12500.00"),
            "currency": "USD",
        },
        {
            "id": uuid.UUID("b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"),
            "account_name": "Recipient Savings (•••• 1042)",
            "balance": Decimal("1000.00"),
            "currency": "USD",
        },
        {
            "id": uuid.UUID("c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33"),
            "account_name": "Low Balance Account (•••• 3311)",
            "balance": Decimal("120.00"),
            "currency": "USD",
        },
    ]

    for acc_info in seed_accounts:
        existing = db.query(Account).filter(Account.id == acc_info["id"]).first()
        if not existing:
            acc = Account(
                id=acc_info["id"],
                account_name=acc_info["account_name"],
                balance=acc_info["balance"],
                currency=acc_info["currency"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(acc)
    try:
        db.commit()
    except Exception:
        db.rollback()
