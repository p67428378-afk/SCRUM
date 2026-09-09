import os
import uuid
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

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
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    """Seed initial data if database is empty."""
    from server.app.models.drug import Drug

    if db.query(Drug).count() == 0:
        sample_drugs = [
            Drug(
                id=str(uuid.uuid4()),
                name="Amoxicillin 500mg",
                generic_name="Amoxicillin",
                dosage="500mg",
                manufacturer="PharmaCorp",
                batch_number="BATCH-2026-A",
                stock_quantity=500,
                expiration_date=date.today() + timedelta(days=365),
                category="Antibiotics",
                unit_price=15.00,
            ),
            Drug(
                id=str(uuid.uuid4()),
                name="Ibuprofen 200mg",
                generic_name="Ibuprofen",
                dosage="200mg",
                manufacturer="HealthLabs",
                batch_number="BATCH-2026-B",
                stock_quantity=15,  # Low stock (<50)
                expiration_date=date.today() + timedelta(days=15),  # Near expiry (<30d)
                category="Analgesics",
                unit_price=8.50,
            ),
            Drug(
                id=str(uuid.uuid4()),
                name="Paracetamol 650mg",
                generic_name="Acetaminophen",
                dosage="650mg",
                manufacturer="MediCare",
                batch_number="BATCH-2026-C",
                stock_quantity=120,
                expiration_date=date.today() + timedelta(days=180),
                category="Analgesics",
                unit_price=5.00,
            ),
        ]
        db.add_all(sample_drugs)
        db.commit()
