from datetime import date, datetime
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.database import Base
from server.extractor import PostgreSQLExtractor
from server.models import RawSalesOrder


@pytest.fixture
def in_memory_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()

    # Seed sample records
    orders = [
        RawSalesOrder(
            order_id="ord-01",
            customer_email="alice@example.com",
            amount=150.0,
            order_date=date(2025, 1, 10),
            created_at=datetime(2025, 1, 10, 12, 0, 0)
        ),
        RawSalesOrder(
            order_id="ord-02",
            customer_email="bob@example.com",
            amount=None,
            order_date=date(2025, 1, 11),
            created_at=datetime(2025, 1, 11, 14, 0, 0)
        ),
        RawSalesOrder(
            order_id="ord-03",
            customer_email="invalid-email",
            amount=200.0,
            order_date=date(2025, 1, 12),
            created_at=datetime(2025, 1, 12, 16, 0, 0)
        ),
    ]
    session.add_all(orders)
    session.commit()

    yield session
    session.close()


def test_extractor_extract_all(in_memory_db):
    extractor = PostgreSQLExtractor(db_session=in_memory_db)
    records = extractor.extract_all()
    assert len(records) == 3
    assert records[0]["order_id"] == "ord-01"
    assert records[0]["customer_email"] == "alice@example.com"
    assert records[0]["amount"] == 150.0


def test_extractor_with_limit(in_memory_db):
    extractor = PostgreSQLExtractor(db_session=in_memory_db)
    records = extractor.extract_all(limit=2)
    assert len(records) == 2


def test_extractor_by_date_range(in_memory_db):
    extractor = PostgreSQLExtractor(db_session=in_memory_db)
    records = extractor.extract_by_date_range(date(2025, 1, 10), date(2025, 1, 11))
    assert len(records) == 2
    order_ids = [r["order_id"] for r in records]
    assert "ord-01" in order_ids
    assert "ord-02" in order_ids
    assert "ord-03" not in order_ids
