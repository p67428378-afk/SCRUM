"""Unit tests for PostgreSQLExtractor."""
from datetime import date, datetime
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.models import Base, RawSalesOrderDB
from server.extractor import PostgreSQLExtractor


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Seed test data
    session.add_all([
        RawSalesOrderDB(
            order_id="ord-101",
            customer_email="customer1@example.com",
            amount=50.0,
            order_date=date(2025, 1, 1),
            created_at=datetime(2025, 1, 1, 10, 0, 0),
        ),
        RawSalesOrderDB(
            order_id="ord-102",
            customer_email="customer2@example.com",
            amount=100.0,
            order_date=date(2025, 1, 2),
            created_at=datetime(2025, 1, 2, 11, 0, 0),
        ),
    ])
    session.commit()

    yield session
    session.close()


def test_extract_raw_orders(db_session):
    extractor = PostgreSQLExtractor(db_session)
    orders = extractor.extract_raw_orders()

    assert len(orders) == 2
    assert orders[0].order_id == "ord-101"
    assert orders[0].amount == 50.0
    assert orders[1].order_id == "ord-102"
    assert orders[1].amount == 100.0


def test_extract_raw_orders_with_limit(db_session):
    extractor = PostgreSQLExtractor(db_session)
    orders = extractor.extract_raw_orders(limit=1)

    assert len(orders) == 1
    assert orders[0].order_id == "ord-101"
