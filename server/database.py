import os
import uuid
from decimal import Decimal
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.types import TypeDecorator, CHAR

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

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
            from sqlalchemy.dialects.postgresql import UUID as PG_UUID

            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(uuid.UUID(str(value)))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(str(value))


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Import all models before create_all
    import server.models.account  # noqa: F401
    import server.models.transfer  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session) -> None:
    from server.models.account import Account
    from sqlalchemy.exc import IntegrityError

    seed_accounts = [
        {
            "id": uuid.UUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"),
            "user_name": "John Doe",
            "balance": Decimal("15420.50"),
        },
        {
            "id": uuid.UUID("b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"),
            "user_name": "Jane Smith",
            "balance": Decimal("5000.00"),
        },
    ]

    for acc_data in seed_accounts:
        existing = db.query(Account).filter(Account.id == acc_data["id"]).first()
        if not existing:
            acc = Account(
                id=acc_data["id"],
                user_name=acc_data["user_name"],
                balance=acc_data["balance"],
            )
            db.add(acc)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()
