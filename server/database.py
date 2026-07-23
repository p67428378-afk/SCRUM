import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# For SQLite, we need to allow multi-threaded access
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
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


def seed_data(db: Session):
    from server import models
    import bcrypt

    hashed_password = bcrypt.hashpw(
        "testpassword".encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    # Seed regular user
    test_user = (
        db.query(models.User).filter(models.User.email == "test@example.com").first()
    )
    if not test_user:
        test_user = models.User(
            email="test@example.com",
            name="Alex Mercer",
            hashed_password=hashed_password,
        )
        db.add(test_user)
        try:
            db.commit()
            db.refresh(test_user)
        except IntegrityError:
            db.rollback()
            test_user = (
                db.query(models.User)
                .filter(models.User.email == "test@example.com")
                .first()
            )

    # Seed some payees
    payees_to_seed = ["Metropolitan Water", "Apex Energy", "Comcast Cable"]
    for payee_name in payees_to_seed:
        payee = db.query(models.Payee).filter(models.Payee.name == payee_name).first()
        if not payee:
            payee = models.Payee(name=payee_name)
            db.add(payee)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()

    # Seed some funding accounts for the test user
    if test_user:
        accounts_to_seed = [
            {
                "account_type": "CHECKING",
                "account_provider": "Primary Checking",
                "account_number_last4": "4321",
                "balance": 5420.00,
                "is_active": True,
            },
            {
                "account_type": "SAVINGS",
                "account_provider": "Joint Savings",
                "account_number_last4": "8765",
                "balance": 12350.00,
                "is_active": True,
            },
            {
                "account_type": "CHECKING",
                "account_provider": "Chase Checking",
                "account_number_last4": "9012",
                "balance": 1850.00,
                "is_active": True,
            },
            {
                "account_type": "SAVINGS",
                "account_provider": "BoA Savings",
                "account_number_last4": "3456",
                "balance": 3200.00,
                "is_active": True,
            },
        ]
        for acc_data in accounts_to_seed:
            acc = (
                db.query(models.FundingAccount)
                .filter(
                    models.FundingAccount.user_id == test_user.id,
                    models.FundingAccount.account_number_last4
                    == acc_data["account_number_last4"],
                )
                .first()
            )
            if not acc:
                acc = models.FundingAccount(
                    user_id=test_user.id,
                    account_type=acc_data["account_type"],
                    account_provider=acc_data["account_provider"],
                    account_number_last4=acc_data["account_number_last4"],
                    balance=acc_data["balance"],
                    is_active=acc_data["is_active"],
                )
                db.add(acc)
                try:
                    db.commit()
                except IntegrityError:
                    db.rollback()
