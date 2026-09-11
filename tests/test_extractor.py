"""Unit tests for extractor module."""
import os
from datetime import date, datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.database import Base
from server.extractor import extract_sales_orders
from server.models import RawSalesOrderDB


def test_extract_sales_orders():
    test_engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=test_engine)
    TestingSession = sessionmaker(bind=test_engine)
    db = TestingSession()

    try:
        order1 = RawSalesOrderDB(
            order_id="11111111-1111-1111-1111-111111111111",
            customer_email="alice@test.com",
            amount=120.0,
            order_date=date(2026, 5, 1),
            created_at=datetime.utcnow()
        )
        order2 = RawSalesOrderDB(
            order_id="22222222-2222-2222-2222-222222222222",
            customer_email="bob@test.com",
            amount=220.0,
            order_date=date(2026, 5, 2),
            created_at=datetime.utcnow()
        )
        db.add_all([order1, order2])
        db.commit()

        extracted = extract_sales_orders(db)
        assert len(extracted) == 2
        assert extracted[0]["order_id"] == "11111111-1111-1111-1111-111111111111"
        assert extracted[1]["customer_email"] == "bob@test.com"

        filtered = extract_sales_orders(db, date_filter=date(2026, 5, 1))
        assert len(filtered) == 1
        assert filtered[0]["order_id"] == "11111111-1111-1111-1111-111111111111"

        limited = extract_sales_orders(db, batch_size=1)
        assert len(limited) == 1
    finally:
        db.close()
