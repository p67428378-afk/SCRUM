"""API endpoint tests for FastAPI ETL service."""
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "sales-order-etl-service"


def test_trigger_etl_endpoint():
    response = client.post("/api/v1/etl/run", json={"batch_size": 100})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "execution_id" in data
    assert "records_extracted" in data
    assert "records_loaded" in data
    assert "records_filtered" in data
