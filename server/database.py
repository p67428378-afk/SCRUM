from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
from server.config import settings

DATABASE_URL = settings.DATABASE_URL

# Use StaticPool for SQLite in-memory tests
if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_data(db):
    from sqlalchemy.exc import IntegrityError
    from server.models import User, UserProfile, Account, Transaction
    import bcrypt
    import uuid
    from datetime import datetime, timezone, timedelta

    def get_password_hash(password: str) -> str:
        pwd_bytes = password.encode("utf-8")
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode("utf-8")

    # Seed regular user
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        test_user = User(
            id=str(uuid.uuid4()),
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            phone_number="+15551234567",
            role="customer",
            is_active=True,
        )
        db.add(test_user)
        db.flush()

        profile = UserProfile(
            user_id=test_user.id,
            full_name="Sarah Jenkins",
            address="123 Financial Way, New York, NY 10001",
        )
        db.add(profile)

        # Seed accounts
        checking = Account(
            id=str(uuid.uuid4()),
            user_id=test_user.id,
            account_type="Checking",
            account_number_masked="...4321",
            balance=12450.80,
            status="active",
        )
        savings = Account(
            id=str(uuid.uuid4()),
            user_id=test_user.id,
            account_type="Savings",
            account_number_masked="...8765",
            balance=85120.45,
            status="active",
        )
        money_market = Account(
            id=str(uuid.uuid4()),
            user_id=test_user.id,
            account_type="Checking",  # Or Money Market, let's use Checking/Savings as per schema
            account_number_masked="...9911",
            balance=250000.00,
            status="active",
        )
        db.add_all([checking, savings, money_market])
        db.flush()

        # Seed transactions
        now = datetime.now(timezone.utc)
        t1 = Transaction(
            id=str(uuid.uuid4()),
            account_id=checking.id,
            date=now - timedelta(hours=2),
            description="Starbucks",
            category="Food & Dining",
            amount=-4.50,
            status="completed",
            reference_id="TXN" + str(uuid.uuid4())[:8].upper(),
        )
        t2 = Transaction(
            id=str(uuid.uuid4()),
            account_id=checking.id,
            date=now - timedelta(days=1),
            description="Salary Deposit",
            category="Income",
            amount=4200.00,
            status="completed",
            reference_id="TXN" + str(uuid.uuid4())[:8].upper(),
        )
        t3 = Transaction(
            id=str(uuid.uuid4()),
            account_id=checking.id,
            date=now - timedelta(days=2),
            description="Whole Foods",
            category="Groceries",
            amount=-142.80,
            status="completed",
            reference_id="TXN" + str(uuid.uuid4())[:8].upper(),
        )
        t4 = Transaction(
            id=str(uuid.uuid4()),
            account_id=checking.id,
            date=now - timedelta(days=4),
            description="Transfer to Savings",
            category="Transfer",
            amount=-500.00,
            status="completed",
            reference_id="TXN" + str(uuid.uuid4())[:8].upper(),
        )
        t5 = Transaction(
            id=str(uuid.uuid4()),
            account_id=checking.id,
            date=now - timedelta(days=5),
            description="Shell Gas Station",
            category="Transportation",
            amount=-45.20,
            status="completed",
            reference_id="TXN" + str(uuid.uuid4())[:8].upper(),
        )
        db.add_all([t1, t2, t3, t4, t5])

    # Seed admin user
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        admin_user = User(
            id=str(uuid.uuid4()),
            username="adminuser",
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            phone_number="+15557654321",
            role="admin",
            is_active=True,
        )
        db.add(admin_user)
        db.flush()

        admin_profile = UserProfile(
            user_id=admin_user.id,
            full_name="Admin Support",
            address="Bank Headquarters, Charlotte, NC 28202",
        )
        db.add(admin_profile)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
