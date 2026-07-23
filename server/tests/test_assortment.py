import pytest
from fastapi.testclient import TestClient
from server.database import seed_data
from server.tests.conftest import TestingSessionLocal


@pytest.fixture(autouse=True)
def seed_test_db():
    db = TestingSessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


def test_health_check(client: TestClient):
    # AC: A RESTful API must be created to support the dashboard.
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_get_kpis(client: TestClient):
    # AC: The dashboard must display a header with the following KPI cards: Sales per linear ft, Private Brand %, In-stock rate, Shelf capacity
    response = client.get("/api/v1/assortment/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "sales_per_linear_ft" in data
    assert "private_brand_percentage" in data
    assert "in_stock_rate" in data
    assert "shelf_capacity" in data
    assert data["sales_per_linear_ft"] == 125.50
    assert data["private_brand_percentage"] == 15.2
    assert data["in_stock_rate"] == 98.5
    assert data["shelf_capacity"] == 85.0


def test_get_skus(client: TestClient):
    # AC: A data grid must display a list of Snacks SKUs with the following columns: Product Name, SKU ID, Sales Performance Metrics, Status Badge
    response = client.get("/api/v1/assortment/skus")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5

    # Verify first item (SNC-001)
    snc = [item for item in data if item["sku_id"] == "SNC-001"][0]
    assert snc["product_name"] == "Spicy Nacho Chips"
    assert snc["weekly_sales"] == 4250.00
    assert snc["profit_margin"] == 0.4200
    assert snc["status"] == "GROW"


def test_get_skus_sorting_and_filtering(client: TestClient):
    # AC: A data grid must display a list of Snacks SKUs with sorting and filtering
    # Filter by status
    response = client.get("/api/v1/assortment/skus?filter_status=GROW")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["sku_id"] == "SNC-001"

    # Sort by weekly_sales desc
    response = client.get("/api/v1/assortment/skus?sort_by=sales&order=desc")
    assert response.status_code == 200
    data = response.json()
    assert data[0]["sku_id"] == "SNC-001"  # 4250.00 is highest
    assert data[-1]["sku_id"] == "SCC-005"  # 850.00 is lowest


def test_get_scenarios(client: TestClient):
    # AC: Three selectable cards must be displayed side-by-side: Conservative, Balanced, Aggressive
    response = client.get("/api/v1/assortment/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    names = [item["name"] for item in data]
    assert "Conservative" in names
    assert "Balanced" in names
    assert "Aggressive" in names


def test_submit_assortment(client: TestClient):
    # AC: This section summarizes the selected scenario and includes a Submit button.
    payload = {
        "scenario_name": "Balanced",
        "submitted_by": "manager@example.com",
        "actions": [
            {"sku_id": "SNC-001", "action": "GROW"},
            {"sku_id": "NEW-001", "action": "ADD"},
        ],
    }
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "SUBMITTED"
    assert "submission_id" in data
    assert "timestamp" in data


def test_submit_assortment_invalid_scenario(client: TestClient):
    # AC: Submit validation - invalid scenario name
    payload = {
        "scenario_name": "SuperAggressive",
        "submitted_by": "manager@example.com",
        "actions": [{"sku_id": "SNC-001", "action": "GROW"}],
    }
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 400
    assert "detail" in response.json()


def test_submit_assortment_empty_actions(client: TestClient):
    # AC: Submit validation - empty actions list
    payload = {
        "scenario_name": "Balanced",
        "submitted_by": "manager@example.com",
        "actions": [],
    }
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 400
    assert "detail" in response.json()
