from datetime import date, datetime
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from server.database import Base, get_db
from server.etl_pipeline import run_pipeline
from server.loader import BigQueryLoader
from server.main import app
from server.models import RawSalesOrder


@pytest.fixture
def mock_db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()

    # Seed records: 2 valid, 1 invalid amount, 1 invalid email
    sample_orders = [
        RawSalesOrder(order_id="rec-1", customer_email="valid1@corp.com", amount=120.50, order_date=date(2025, 2, 1), created_at=datetime(2025, 2, 1, 10, 0, 0)),
        RawSalesOrder(order_id="rec-2", customer_email="valid2@corp.com", amount=340.00, order_date=date(2025, 2, 1), created_at=datetime(2025, 2, 1, 11, 0, 0)),
        RawSalesOrder(order_id="rec-3", customer_email="valid3@corp.com", amount=None, order_date=date(2025, 2, 1), created_at=datetime(2025, 2, 1, 12, 0, 0)),
        RawSalesOrder(order_id="rec-4", customer_email="bad_email_at_nowhere", amount=50.00, order_date=date(2025, 2, 1), created_at=datetime(2025, 2, 1, 13, 0, 0)),
    ]
    session.add_all(sample_orders)
    session.commit()

    yield session
    session.close()


def test_full_pipeline_run(mock_db_session):
    loader = BigQueryLoader(project_id="test-proj", dataset_id="test_ds", table_name="fct_sales_orders")
    metrics = run_pipeline(dry_run=True, db_session=mock_db_session, loader=loader)

    assert metrics["status"] == "SUCCESS"
    assert metrics["records_extracted"] == 4
    assert metrics["records_loaded"] == 2
    assert metrics["records_filtered"] == 2
    assert metrics["filter_breakdown"]["missing_or_invalid_amount"] == 1
    assert metrics["filter_breakdown"]["invalid_email_rfc5322"] == 1
    assert "execution_id" in metrics


def test_api_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_api_status_endpoint():
    client = TestClient(app)
    response = client.get("/api/v1/etl/status")
    assert response.status_code == 200


def test_api_run_etl_endpoint():
    client = TestClient(app)
    response = client.post("/api/v1/etl/run", json={"dry_run": True})
    assert response.status_code == 200
    data = response.json()
    assert "execution_id" in data
    assert "status" in data
