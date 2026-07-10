import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Set testing environment variable
os.environ["DATABASE_URL"] = "sqlite:///./test_temp.db"

from .database import Base, get_db
from .main import app

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_get_kpis():
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "sales_per_linear_ft" in data
    assert "private_brand_pct" in data
    assert "in_stock_rate" in data
    assert "shelf_capacity" in data


def test_get_skus():
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) >= 0


def test_get_scenario_balanced():
    response = client.get("/api/v1/scenarios/Balanced")
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "Balanced"
    assert data["projected_sales_change_pct"] == 3.5


def test_get_scenario_not_found():
    response = client.get("/api/v1/scenarios/Unknown")
    assert response.status_code == 404


def test_submit_assortment_balanced():
    response = client.post("/api/v1/assortments", json={"scenario_name": "Balanced"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "APPROVED"
    assert "transaction_id" in data
    assert "timestamp" in data


def test_submit_assortment_aggressive_fails_guardrail():
    response = client.post("/api/v1/assortments", json={"scenario_name": "Aggressive"})
    assert response.status_code == 400
    assert "Guardrail check failed" in response.json()["detail"]


def test_get_assortment_by_transaction_id():
    # First submit
    submit_res = client.post("/api/v1/assortments", json={"scenario_name": "Balanced"})
    txn_id = submit_res.json()["transaction_id"]

    # Then fetch
    response = client.get(f"/api/v1/assortments/{txn_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_id"] == txn_id
    assert data["scenario_name"] == "Balanced"
