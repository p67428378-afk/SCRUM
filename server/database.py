import os
from decimal import Decimal
from typing import Generator
import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker, Session

from server.models import Base, User, Account

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./p2p_transfers.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_password_hash(password: str) -> str:
    """Hash password using bcrypt directly."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash."""
    pwd_bytes = plain_password.encode("utf-8")[:72]
    hash_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hash_bytes)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_data(db: Session) -> None:
    """Seed initial users and accounts idempotently."""
    seed_users = [
        {
            "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "email": "test@example.com",
            "password": "testpassword",
            "name": "Alexander Wright",
            "handle": "usr_alexander",
            "role": "user",
            "account_id": "acc-a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "account_number": "CHK-8492",
            "balance": Decimal("5000.00"),
        },
        {
            "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
            "email": "admin@example.com",
            "password": "adminpassword",
            "name": "System Administrator",
            "handle": "usr_admin",
            "role": "admin",
            "account_id": "acc-c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
            "account_number": "CHK-9999",
            "balance": Decimal("15000.00"),
        },
        {
            "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
            "email": "receiver@example.com",
            "password": "testpassword",
            "name": "Marcus Vance",
            "handle": "usr_987654",
            "role": "user",
            "account_id": "acc-b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
            "account_number": "CHK-1234",
            "balance": Decimal("1000.00"),
        },
        {
            "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
            "email": "lowbalance@example.com",
            "password": "testpassword",
            "name": "Low Balance User",
            "handle": "usr_lowbalance",
            "role": "user",
            "account_id": "acc-d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
            "account_number": "CHK-5555",
            "balance": Decimal("200.00"),
        },
    ]

    for user_info in seed_users:
        try:
            existing_user = (
                db.query(User).filter(User.email == user_info["email"]).first()
            )
            if not existing_user:
                new_user = User(
                    id=user_info["id"],
                    email=user_info["email"],
                    hashed_password=get_password_hash(user_info["password"]),
                    name=user_info["name"],
                    handle=user_info["handle"],
                    role=user_info["role"],
                    is_active=True,
                    is_verified=True,
                )
                db.add(new_user)
                db.flush()

                new_account = Account(
                    id=user_info["account_id"],
                    user_id=new_user.id,
                    account_number=user_info["account_number"],
                    account_type="checking",
                    balance=user_info["balance"],
                    currency="USD",
                )
                db.add(new_account)
                db.commit()
            else:
                # Ensure account exists for existing user
                account = (
                    db.query(Account)
                    .filter(Account.user_id == existing_user.id)
                    .first()
                )
                if not account:
                    new_account = Account(
                        id=user_info["account_id"],
                        user_id=existing_user.id,
                        account_number=user_info["account_number"],
                        account_type="checking",
                        balance=user_info["balance"],
                        currency="USD",
                    )
                    db.add(new_account)
                    db.commit()
        except IntegrityError:
            db.rollback()


def init_db() -> None:
    """Initialize database tables and seed baseline data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
