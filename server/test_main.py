"""
Module: test_main
Purpose: Unit and integration tests for the FastAPI application.
Author: Backend_Worker
Created: 2026-06-30
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from server.database import Base, get_db
from server.main import app

# Setup test database
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """
    Function-scoped database session fixture.
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """
    Function-scoped TestClient fixture with database override.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_get_kpis_success(client):
    # AC: The dashboard must feature a prominent header strip at the top, displaying a row of key performance indicator (KPI) cards.
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "in_stock_rate" in data
    assert "private_brand_percentage" in data
    assert "sales_per_linear_ft" in data
    assert "shelf_capacity_used" in data
    assert data["in_stock_rate"] == 96.0
    assert data["private_brand_percentage"] == 22.5


def test_get_skus_success(client):
    # AC: A detailed table must display all relevant Snacks SKUs, their individual performance metrics, and a system-generated recommendation status.
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # Verify first item structure
    first_sku = data[0]
    assert "sku" in first_sku
    assert "product_name" in first_sku
    assert "sales_revenue" in first_sku
    assert "units_sold" in first_sku
    assert "profit_margin" in first_sku
    assert "in_stock_rate" in first_sku
    assert "recommendation_status" in first_sku


def test_get_skus_sorting(client):
    # AC: A detailed table must display all relevant Snacks SKUs, their individual performance metrics, and a system-generated recommendation status.
    # Test sorting by sales_revenue
    response = client.get("/api/v1/skus?sort_by=sales_revenue")
    assert response.status_code == 200
    data = response.json()
    revenues = [item["sales_revenue"] for item in data]
    assert revenues == sorted(revenues, reverse=True)


def test_get_skus_filtering(client):
    # AC: A detailed table must display all relevant Snacks SKUs, their individual performance metrics, and a system-generated recommendation status.
    # Test filtering by status=GROW
    response = client.get("/api/v1/skus?status=GROW")
    assert response.status_code == 200
    data = response.json()
    for item in data:
        assert item["recommendation_status"] == "GROW"


def test_get_scenario_success(client):
    # AC: The user must be able to choose from three distinct, side-by-side scenario cards, each representing a different strategic approach to assortment changes.
    response = client.get("/api/v1/scenarios/Balanced")
    assert response.status_code == 200
    data = response.json()
    assert data["scenario_name"] == "Balanced"
    assert "projected_sales_impact" in data
    assert "projected_private_brand_impact" in data
    assert "guardrails" in data
    assert "sku_actions" in data


def test_get_scenario_not_found(client):
    # AC: The user must be able to choose from three distinct, side-by-side scenario cards, each representing a different strategic approach to assortment changes.
    response = client.get("/api/v1/scenarios/InvalidScenario")
    assert response.status_code == 404
    assert response.json()["detail"] == "Scenario 'InvalidScenario' not found or invalid."


def test_get_scenario_outcomes(client):
    # AC: A dedicated panel that summarizes the projected outcomes of the currently selected scenario.
    response = client.get("/api/v1/scenarios/Conservative")
    assert response.status_code == 200
    data = response.json()
    assert data["projected_sales_impact"] == 3.0
    assert data["projected_private_brand_impact"] == 1.0


def test_submit_approval_success(client):
    # AC: Upon clicking the "Submit" button, the form is replaced by an inline confirmation message on the same screen.
    payload = {
        "scenario_name": "Balanced",
        "decision_payload": {
            "projected_sales_impact": 7.0,
            "projected_private_brand_impact": 3.0,
            "sku_actions": {
                "add": ["SKU-123"],
                "remove": ["SKU-789"],
                "swap": [{"add_sku": "SKU-345", "remove_sku": "SKU-012"}]
            }
        }
    }
    response = client.post("/api/v1/approvals", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "audit_id" in data
    assert "timestamp" in data
    assert data["submitted_by"] == "user123"


def test_submit_approval_invalid_scenario(client):
    # AC: Upon clicking the "Submit" button, the form is replaced by an inline confirmation message on the same screen.
    payload = {
        "scenario_name": "InvalidScenario",
        "decision_payload": {
            "projected_sales_impact": 7.0,
            "projected_private_brand_impact": 3.0,
            "sku_actions": {
                "add": ["SKU-123"],
                "remove": ["SKU-789"],
                "swap": [{"add_sku": "SKU-345", "remove_sku": "SKU-012"}]
            }
        }
    }
    response = client.post("/api/v1/approvals", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid scenario name 'InvalidScenario'."
