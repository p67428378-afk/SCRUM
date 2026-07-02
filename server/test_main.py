import os
import pytest
from fastapi.testclient import TestClient

# Set TESTING environment variable before importing app
os.environ["TESTING"] = "true"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from .main import app
from .database import Base, engine

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables
    Base.metadata.drop_all(bind=engine)


def test_get_dashboard():
    response = client.get("/api/v1/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "skus" in data
    assert len(data["skus"]) == 2
    assert data["skus"][0]["sku_id"] == "SKU-1001"


def test_apply_scenario_balanced():
    response = client.post("/api/v1/scenarios/balanced/apply")
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "Balanced"
    assert data["projected_sales_lift"] == 3.2
    assert data["guardrails"]["private_brand_valid"] is True


def test_apply_scenario_invalid():
    response = client.post("/api/v1/scenarios/invalid_scenario/apply")
    assert response.status_code == 400
    assert "Invalid scenario name" in response.json()["detail"]


def test_submit_assortment_success():
    payload = {
        "scenario_name": "Balanced",
        "projected_sales_lift": 3.2,
        "projected_private_brand_pct": 28.1,
        "sku_actions": [
            {"sku_id": "SKU-1002", "action": "SWAP", "replacement_sku_id": "SKU-2001"}
        ],
    }
    response = client.post("/api/v1/assortments/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "confirmation_number" in data
    assert "submission_id" in data


def test_submit_assortment_guardrail_violation():
    payload = {
        "scenario_name": "Aggressive",
        "projected_sales_lift": 5.8,
        "projected_private_brand_pct": 24.5,  # Violates private brand guardrail (> 25%)
        "sku_actions": [
            {"sku_id": "SKU-1002", "action": "SWAP", "replacement_sku_id": "SKU-2001"}
        ],
    }
    response = client.post("/api/v1/assortments/submit", json=payload)
    assert response.status_code == 400
    assert "Guardrail violations" in response.json()["detail"]
