"""
Module: server.tests.test_endpoints
Purpose: Unit and integration tests for the API endpoints.
Author: Backend Developer Agent
Created: 2026-06-24
"""

from server.app.models import User


def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "DG Cluster Assortment Advisor API",
    }


def test_get_dashboard_happy_path(client, db):
    # AC: GET /api/v1/assortment/dashboard returning kpi_metrics, sku_performance, and scenarios
    response = client.get("/api/v1/assortment/dashboard")
    assert response.status_code == 200
    data = response.json()

    # Verify KPI metrics
    assert "kpi_metrics" in data
    assert data["kpi_metrics"]["in_stock_rate"] == 96.2
    assert data["kpi_metrics"]["private_brand_pct"] == 28.4
    assert data["kpi_metrics"]["sales_per_linear_ft"] == 124.5
    assert data["kpi_metrics"]["shelf_capacity"] == 85.0

    # Verify SKU performance
    assert "sku_performance" in data
    assert len(data["sku_performance"]) == 1
    sku = data["sku_performance"][0]
    assert sku["sku"] == "SKU-1001"
    assert sku["name"] == "Lay's Classic Potato Chips 8oz"
    assert sku["brand"] == "Lay's"
    assert sku["private_brand"] is False
    assert sku["sales"] == 15200.0
    assert sku["linear_ft"] == 2.5
    assert sku["sales_per_linear_ft"] == 6080.0
    assert sku["in_stock_rate"] == 98.5
    assert sku["shelf_capacity_pct"] == 75.0
    assert sku["recommended_action"] == "MAINTAIN"

    # Verify Scenarios
    assert "scenarios" in data
    assert len(data["scenarios"]) == 3
    scenarios = {s["name"]: s for s in data["scenarios"]}
    assert "Conservative" in scenarios
    assert "Balanced" in scenarios
    assert "Aggressive" in scenarios

    assert (
        scenarios["Balanced"]["description"]
        == "Optimized mix of national and private brands to balance sales and margin."
    )
    assert scenarios["Balanced"]["guardrails"]["private_brand_target_met"] is True
    assert scenarios["Balanced"]["projected_impact"]["sales_per_linear_ft"] == 128.4


def test_submit_assortment_happy_path_test_token(client, db):
    # AC: POST /api/v1/assortment/submit receiving selected scenario and SKU actions and returning confirmation with audit trail ID
    # First trigger dashboard to seed initial data
    client.get("/api/v1/assortment/dashboard")

    payload = {
        "scenario_name": "Balanced",
        "sku_actions": [{"sku": "SKU-1001", "action": "GROW"}],
    }
    headers = {"Authorization": "Bearer test-token"}
    response = client.post("/api/v1/assortment/submit", json=payload, headers=headers)

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "audit_trail_id" in data
    assert data["submitted_by"] == "category_manager@dollargeneral.com"
    assert "submitted_at" in data


def test_submit_assortment_happy_path_jwt_token(client, db):
    # AC: POST /api/v1/assortment/submit receiving selected scenario and SKU actions and returning confirmation with audit trail ID
    # First trigger dashboard to seed initial data
    client.get("/api/v1/assortment/dashboard")

    # Create a user and log in to get a real JWT token
    from server.app.api.endpoints import hash_password

    user = User(
        email="manager@dollargeneral.com",
        hashed_password=hash_password("password123"),
        role="Category Manager",
    )
    db.add(user)
    db.commit()

    login_response = client.post(
        "/api/v1/auth/token",
        data={"username": "manager@dollargeneral.com", "password": "password123"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    payload = {
        "scenario_name": "Balanced",
        "sku_actions": [{"sku": "SKU-1001", "action": "GROW"}],
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/api/v1/assortment/submit", json=payload, headers=headers)

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["submitted_by"] == "manager@dollargeneral.com"


def test_submit_assortment_forbidden_role(client, db):
    # AC: POST /api/v1/assortment/submit returns 403 on forbidden role
    client.get("/api/v1/assortment/dashboard")

    # Create a user with a non-authorized role
    from server.app.api.endpoints import hash_password

    user = User(
        email="viewer@dollargeneral.com",
        hashed_password=hash_password("password123"),
        role="Viewer",
    )
    db.add(user)
    db.commit()

    login_response = client.post(
        "/api/v1/auth/token",
        data={"username": "viewer@dollargeneral.com", "password": "password123"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    payload = {
        "scenario_name": "Balanced",
        "sku_actions": [{"sku": "SKU-1001", "action": "GROW"}],
    }
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/api/v1/assortment/submit", json=payload, headers=headers)

    assert response.status_code == 403
    assert response.json()["detail"] == "Forbidden: Insufficient permissions"


def test_submit_assortment_invalid_scenario(client, db):
    # AC: POST /api/v1/assortment/submit returns 400 on invalid scenario name
    client.get("/api/v1/assortment/dashboard")

    payload = {
        "scenario_name": "NonExistentScenario",
        "sku_actions": [{"sku": "SKU-1001", "action": "GROW"}],
    }
    headers = {"Authorization": "Bearer test-token"}
    response = client.post("/api/v1/assortment/submit", json=payload, headers=headers)

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid scenario name"


def test_submit_assortment_empty_sku_actions(client, db):
    # AC: POST /api/v1/assortment/submit returns 400 on empty SKU actions list
    client.get("/api/v1/assortment/dashboard")

    payload = {"scenario_name": "Balanced", "sku_actions": []}
    headers = {"Authorization": "Bearer test-token"}
    response = client.post("/api/v1/assortment/submit", json=payload, headers=headers)

    assert response.status_code == 400
    assert response.json()["detail"] == "SKU actions list cannot be empty"


def test_submit_assortment_unauthorized(client, db):
    # AC: POST /api/v1/assortment/submit returns 401 on unauthorized access attempt
    client.get("/api/v1/assortment/dashboard")

    payload = {
        "scenario_name": "Balanced",
        "sku_actions": [{"sku": "SKU-1001", "action": "GROW"}],
    }
    # No Authorization header
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Unauthorized access attempt"

    # Invalid token
    headers = {"Authorization": "Bearer invalid-token"}
    response = client.post("/api/v1/assortment/submit", json=payload, headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Unauthorized access attempt"
