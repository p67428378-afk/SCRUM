from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)


def test_get_kpis():
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "sales_per_linear_ft" in data
    assert "private_brand_share" in data
    assert "in_stock_rate" in data
    assert "shelf_capacity_utilization" in data


def test_get_skus():
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0
    assert data["items"][0]["sku_id"] == "SKU-8821"


def test_get_scenario_balanced():
    response = client.get("/api/v1/scenarios/balanced")
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "balanced"
    assert "guardrails" in data


def test_get_scenario_not_found():
    response = client.get("/api/v1/scenarios/unknown")
    assert response.status_code == 404


def test_submit_approval_success():
    response = client.post("/api/v1/approvals", json={"scenario_name": "balanced"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "transaction_id" in data

    # Test audit trail retrieval
    txn_id = data["transaction_id"]
    audit_response = client.get(f"/api/v1/approvals/{txn_id}")
    assert audit_response.status_code == 200
    audit_data = audit_response.json()
    assert audit_data["scenario_name"] == "balanced"


def test_submit_approval_invalid():
    response = client.post(
        "/api/v1/approvals", json={"scenario_name": "invalid_scenario"}
    )
    assert response.status_code == 400
