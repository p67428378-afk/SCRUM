"""Integration tests for the complete ETL pipeline."""
from datetime import date, datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.database import Base
from server.etl_pipeline import run_etl_pipeline
from server.loader import BigQueryLoader
from server.models import RawSalesOrderDB


def test_full_etl_pipeline_flow():
    test_engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=test_engine)
    TestingSession = sessionmaker(bind=test_engine)
    db = TestingSession()

    try:
        orders = [
            RawSalesOrderDB(
                order_id="valid-1",
                customer_email="valid1@domain.com",
                amount=150.0,
                order_date=date(2026, 5, 10),
                created_at=datetime.utcnow()
            ),
            RawSalesOrderDB(
                order_id="valid-2",
                customer_email="valid2@domain.com",
                amount=250.0,
                order_date=date(2026, 5, 10),
                created_at=datetime.utcnow()
            ),
            RawSalesOrderDB(
                order_id="invalid-amount",
                customer_email="valid3@domain.com",
                amount=None,
                order_date=date(2026, 5, 10),
                created_at=datetime.utcnow()
            ),
            RawSalesOrderDB(
                order_id="invalid-email",
                customer_email="invalid_email_no_at",
                amount=300.0,
                order_date=date(2026, 5, 10),
                created_at=datetime.utcnow()
            )
        ]
        db.add_all(orders)
        db.commit()

        loader = BigQueryLoader(project_id="test-p", dataset_id="test_d", table_id="fct_sales_orders", simulation_mode=True)
        result = run_etl_pipeline(db=db, loader=loader)

        assert result.status == "SUCCESS"
        assert result.records_extracted == 4
        assert result.records_loaded == 2
        assert result.records_filtered == 2
        assert result.filter_breakdown.missing_or_invalid_amount == 1
        assert result.filter_breakdown.invalid_email_rfc5322 == 1
    finally:
        db.close()
