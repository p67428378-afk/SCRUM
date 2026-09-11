"""Integration tests for ETL Pipeline and API endpoints."""
from datetime import date, datetime
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from server.database import get_db
from server.models import Base, RawSalesOrderDB
from server.etl_pipeline import ETLPipeline
from server.loader import BigQueryLoader
from server.main import app


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Seed mix of valid and invalid data
    session.add_all([
        # Valid
        RawSalesOrderDB(
            order_id="11111111-1111-1111-1111-111111111111",
            customer_email="valid1@example.com",
            amount=150.0,
            order_date=date(2025, 3, 1),
            created_at=datetime(2025, 3, 1, 10, 0, 0),
        ),
        # Missing amount
        RawSalesOrderDB(
            order_id="22222222-2222-2222-2222-222222222222",
            customer_email="valid2@example.com",
            amount=None,
            order_date=date(2025, 3, 1),
            created_at=datetime(2025, 3, 1, 11, 0, 0),
        ),
        # Invalid email
        RawSalesOrderDB(
            order_id="33333333-3333-3333-3333-333333333333",
            customer_email="invalid-email-address",
            amount=250.0,
            order_date=date(2025, 3, 2),
            created_at=datetime(2025, 3, 2, 12, 0, 0),
        ),
    ])
    session.commit()

    yield session
    session.close()


def test_etl_pipeline_run(db_session):
    mock_loader = MagicMock(spec=BigQueryLoader)
    mock_loader.load_orders.return_value = 1

    pipeline = ETLPipeline(db_session=db_session, loader=mock_loader)
    result = pipeline.run()

    assert result.status == "SUCCESS"
    assert result.records_extracted == 3
    assert result.records_loaded == 1
    assert result.records_filtered == 2
    assert result.filter_breakdown.missing_or_invalid_amount == 1
    assert result.filter_breakdown.invalid_email_rfc5322 == 1


def test_api_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_api_v1_health():
    client = TestClient(app)
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_api_etl_run(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    with patch.object(BigQueryLoader, "load_orders", return_value=1):
        response = client.post("/api/v1/etl/run")
        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "SUCCESS"
        assert data["records_extracted"] == 3
        assert data["records_loaded"] == 1
        assert data["records_filtered"] == 2
        assert data["filter_breakdown"]["missing_or_invalid_amount"] == 1
        assert data["filter_breakdown"]["invalid_email_rfc5322"] == 1

    app.dependency_overrides.clear()
