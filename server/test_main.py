# Pytest suite for FastAPI endpoints
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Set TESTING environment variable
os.environ["TESTING"] = "true"

from .database import Base, get_db
from .main import app
from . import models

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
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


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)

    # Seed scenarios for testing since startup event might not run or might run on a different DB
    db = TestingSessionLocal()
    try:
        if db.query(models.AssortmentScenario).count() == 0:
            s_balanced = models.AssortmentScenario(
                name="Balanced",
                projected_sales_growth=4.2,
                projected_private_brand_pct=35.0,
                projected_shelf_capacity_pct=85.0,
                sku_actions=[{"sku": "SKU-1001", "action": "GROW"}],
            )
            db.add(s_balanced)
            db.commit()
    finally:
        db.close()

    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_temp.db"):
        os.remove("./test_temp.db")


client = TestClient(app)


def test_get_kpis():
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "sales_per_linear_ft" in data
    assert "private_brand_pct" in data
    assert "in_stock_rate" in data
    assert "shelf_capacity" in data


def test_get_sku_performance():
    response = client.get("/api/v1/sku-performance")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "limit" in data


def test_get_scenario_balanced():
    response = client.get("/api/v1/scenarios/Balanced")
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "Balanced"
    assert "projected_sales_growth" in data
    assert "sku_actions" in data


def test_get_scenario_not_found():
    response = client.get("/api/v1/scenarios/UnknownScenario")
    assert response.status_code == 404


def test_create_assortment_plan():
    payload = {
        "scenario_name": "Balanced",
        "plan_details": {
            "notes": "Test submission",
            "sku_actions": [{"sku": "SKU-1001", "action": "GROW"}],
        },
    }
    response = client.post("/api/v1/assortment-plans", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "Balanced"
    assert data["status"] == "SUCCESS"
    assert "id" in data


def test_create_assortment_plan_invalid_scenario():
    payload = {"scenario_name": "InvalidScenario", "plan_details": {}}
    response = client.post("/api/v1/assortment-plans", json=payload)
    assert response.status_code == 400
