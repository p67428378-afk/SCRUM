import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Set testing environment variable
os.environ["TESTING"] = "true"
os.environ["DATABASE_URL"] = "sqlite:///./test_run.db"

from .database import get_db
from .main import app
from . import crud, models

# Setup SQLite database for testing
engine = create_engine(
    "sqlite:///./test_run.db", connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    # Create tables and seed data before each test
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    crud.seed_initial_data(db)
    db.close()


client = TestClient(app)


def test_read_kpis():
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "sales_per_linear_ft" in data
    assert "private_brand_pct" in data
    assert "in_stock_rate" in data
    assert "shelf_capacity" in data
    assert data["private_brand_pct"] > 0


def test_read_sku_performance():
    response = client.get("/api/v1/sku-performance")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) > 0
    assert data["items"][0]["sku"] == "SKU-1001"


def test_read_sku_performance_search():
    response = client.get("/api/v1/sku-performance?search=Potato")
    assert response.status_code == 200
    data = response.json()
    assert (
        len(data["items"]) == 2
    )  # Clover Valley Potato Chips Classic, Lay's Classic Potato Chips


def test_read_scenario_balanced():
    response = client.get("/api/v1/scenarios/Balanced")
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "Balanced"
    assert len(data["sku_actions"]) > 0


def test_read_scenario_not_found():
    response = client.get("/api/v1/scenarios/UnknownScenario")
    assert response.status_code == 404


def test_create_assortment_plan():
    payload = {
        "scenario_name": "Balanced",
        "plan_details": {"notes": "Approved for Q3 rollout", "bypass_guardrails": True},
    }
    response = client.post("/api/v1/assortment-plans", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["scenario_name"] == "Balanced"
