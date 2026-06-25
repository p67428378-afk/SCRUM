import os

os.environ["TESTING"] = "true"

from fastapi.testclient import TestClient
from server.main import app
from server.database import Base, engine
# Import models to register them on Base.metadata

# Re-create tables for testing
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "message": "Welcome to the DG Cluster Assortment Advisor API"
    }


def test_get_kpis():
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "sales_per_linear_ft" in data
    assert "private_brand_pct" in data
    assert "in_stock_rate" in data
    assert "shelf_capacity" in data
    assert data["sales_per_linear_ft"] == 15.75


def test_get_skus():
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "sku_id" in data[0]
    assert "product_name" in data[0]
    assert "sales_ytd" in data[0]
    assert "units_sold" in data[0]
    assert "profit_margin" in data[0]
    assert "status" in data[0]


def test_get_scenario_success():
    response = client.get("/api/v1/scenarios/Balanced")
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "Balanced"
    assert "projected_sales_impact" in data
    assert "projected_pb_pct" in data
    assert "sku_actions" in data
    assert "guardrails" in data


def test_get_scenario_not_found():
    response = client.get("/api/v1/scenarios/invalid_scenario")
    assert response.status_code == 404
    assert "detail" in response.json()


def test_submit_review_success():
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
    assert "message" in data
    assert "submitted_at" in data
    assert "transaction_id" in data
    assert "Balanced" in data["message"]


def test_submit_review_invalid_scenario():
    payload = {
        "selected_scenario": "InvalidScenario",
        "sku_actions": [{"sku_id": "SKU-1001", "action": "GROW"}],
    }
    response = client.post("/api/v1/reviews", json=payload)
    assert response.status_code == 400
    assert "detail" in response.json()
