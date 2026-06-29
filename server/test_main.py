import os

os.environ["TESTING"] = "true"

import pytest
from fastapi.testclient import TestClient
from .main import app
from .database import Base, engine, SessionLocal
from . import crud

client = TestClient(app)


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        crud.seed_skus(db)
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_get_kpis():
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "sales_per_linear_ft" in data
    assert data["sales_per_linear_ft"]["value"] == 145.5
    assert data["private_brand_pct"]["value"] == 28.4
    assert data["in_stock_rate"]["value"] == 96.2
    assert data["shelf_capacity"]["value"] == 88.0


def test_get_skus():
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["name"] == "Clover Valley Potato Chips Classic 10oz"
    assert data[0]["private_brand"] is True
    assert data[0]["status"] == "GROW"


def test_get_skus_search():
    response = client.get("/api/v1/skus?search=Classic")
    assert response.status_code == 200
    data = response.json()
    assert (
        len(data) == 2
    )  # Clover Valley Potato Chips Classic 10oz, Lay's Classic Potato Chips 13oz
    assert any(sku["name"] == "Clover Valley Potato Chips Classic 10oz" for sku in data)


def test_get_skus_status():
    response = client.get("/api/v1/skus?status=GROW")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(sku["status"] == "GROW" for sku in data)


def test_get_scenario_balanced():
    response = client.get("/api/v1/scenarios/balanced")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "balanced"
    assert data["projected_sales_impact"] == 4.2
    assert data["guardrails"]["private_brand_goal_met"] is True
    assert len(data["skus_to_action"]) > 0


def test_get_scenario_not_found():
    response = client.get("/api/v1/scenarios/unknown")
    assert response.status_code == 404


def test_create_assortment_review():
    # First get a SKU ID
    skus_response = client.get("/api/v1/skus")
    sku_id = skus_response.json()[0]["id"]

    payload = {
        "scenario_name": "balanced",
        "submission_data": {"actions": [{"sku_id": sku_id, "action": "GROW"}]},
    }
    response = client.post("/api/v1/assortment-reviews", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "balanced"
    assert data["status"] == "SUCCESS"
    assert "audit_id" in data
    assert "id" in data
    assert data["submission_data"]["actions"][0]["sku_id"] == sku_id


def test_create_assortment_review_invalid_scenario():
    payload = {"scenario_name": "invalid_scenario", "submission_data": {"actions": []}}
    response = client.post("/api/v1/assortment-reviews", json=payload)
    assert response.status_code == 400
