import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os

# Set TESTING environment variable
os.environ["TESTING"] = "true"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from server.main import app
from server.database import Base, get_db
from server.crud import seed_data

# Setup test database with StaticPool for in-memory SQLite
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    seed_data(db_session)
    yield db_session
    db_session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "message": "Welcome to the DG Cluster Assortment Advisor API"
    }


def test_get_kpis(client):
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "in_stock_rate" in data
    assert "private_brand_pct" in data
    assert "sales_per_linear_ft" in data
    assert "shelf_capacity" in data
    assert data["in_stock_rate"] == 94.5


def test_get_skus(client):
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "sku_id" in data[0]
    assert "product_name" in data[0]
    assert "sales_ytd" in data[0]


def test_get_scenario_valid(client):
    response = client.get("/api/v1/scenarios/Balanced")
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "Balanced"
    assert "projected_sales_impact" in data
    assert "sku_actions" in data
    assert len(data["sku_actions"]) > 0


def test_get_scenario_invalid(client):
    response = client.get("/api/v1/scenarios/InvalidScenario")
    assert response.status_code == 404
    assert "detail" in response.json()


def test_submit_review_valid(client):
    payload = {
        "selected_scenario": "Balanced",
        "sku_actions": [
            {"sku_id": "SKU-1001", "action": "GROW"},
            {"sku_id": "SKU-1002", "action": "REDUCE"},
        ],
    }
    response = client.post("/api/v1/reviews", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "transaction_id" in data
    assert "message" in data


def test_submit_review_invalid_scenario(client):
    payload = {
        "selected_scenario": "InvalidScenario",
        "sku_actions": [{"sku_id": "SKU-1001", "action": "GROW"}],
    }
    response = client.post("/api/v1/reviews", json=payload)
    assert response.status_code == 400
    assert "detail" in response.json()
