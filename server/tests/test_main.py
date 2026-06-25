"""
Module: test_main
Purpose: Pytest suite for the FastAPI application.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from server.main import app
from server.database import Base, get_db

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function", autouse=True)
def setup_db():
    """
    Re-create database tables before each test function.
    """
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_check():
    """
    Test the health check endpoint.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_get_dashboard_kpis():
    # AC: The dashboard must display a header row with four key performance indicator (KPI) cards: Sales per Linear Ft, Private Brand %, In-Stock Rate, and Shelf Capacity.
    response = client.get("/api/v1/assortment/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    kpis = data["kpis"]
    assert "sales_per_linear_ft" in kpis
    assert "private_brand_pct" in kpis
    assert "in_stock_rate" in kpis
    assert "shelf_capacity" in kpis
    assert kpis["sales_per_linear_ft"] == 250.0
    assert kpis["private_brand_pct"] == 18.0

def test_get_dashboard_skus():
    # AC: A detailed table must list all Snacks SKUs with key performance metrics (Sales, Units, Margin, Days of Supply) and a Status badge (GROW, MAINTAIN, SWAP, REDUCE).
    response = client.get("/api/v1/assortment/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "skus" in data
    skus = data["skus"]
    assert len(skus) >= 2
    sku1 = skus[0]
    assert "sku" in sku1
    assert "name" in sku1
    assert "sales" in sku1
    assert "units" in sku1
    assert "margin" in sku1
    assert "days_of_supply" in sku1
    assert "private_brand" in sku1
    assert "status" in sku1
    assert sku1["status"] in ["GROW", "MAINTAIN", "SWAP", "REDUCE"]

def test_get_dashboard_scenarios():
    # AC: Three selectable option cards must be presented side-by-side: Conservative, Balanced, and Aggressive. Balanced is selected by default. Each card displays projected impact metrics.
    response = client.get("/api/v1/assortment/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    scenarios = data["scenarios"]
    assert "conservative" in scenarios
    assert "balanced" in scenarios
    assert "aggressive" in scenarios
    
    balanced = scenarios["balanced"]
    assert balanced["name"] == "Balanced"
    assert "projected_sales_impact" in balanced
    assert "projected_private_brand_pct" in balanced
    assert "projected_shelf_capacity" in balanced
    assert "guardrails" in balanced
    assert "sku_actions" in balanced

def test_submit_balanced_success():
    # AC: Upon clicking Submit, an inline confirmation message (banner or modal) on the same screen confirms success and provides an audit-trail summary.
    payload = {
        "scenario_name": "Balanced",
        "submitted_by": "Category Manager",
        "sku_actions": [
            {"sku": "SKU-1001", "action": "GROW"},
            {"sku": "SKU-1002", "action": "MAINTAIN"}
        ]
    }
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["scenario_name"] == "Balanced"
    assert data["submitted_by"] == "Category Manager"
    assert len(data["sku_actions"]) == 2
    assert "submission_timestamp" in data

def test_submit_aggressive_fails_guardrail():
    # AC: The Approval Review Panel summarizes actions for the selected scenario, lists SKU changes, checks business guardrails (Private Brand % >= 20%), and has a Submit button.
    payload = {
        "scenario_name": "Aggressive",
        "submitted_by": "Category Manager",
        "sku_actions": [
            {"sku": "SKU-1001", "action": "GROW"},
            {"sku": "SKU-1002", "action": "SWAP"}
        ]
    }
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "Guardrail validation failed" in data["detail"]

def test_submit_invalid_body():
    # AC: The Approval Review Panel summarizes actions for the selected scenario, lists SKU changes, checks business guardrails (Private Brand % >= 20%), and has a Submit button.
    payload = {
        "scenario_name": "Balanced",
        "submitted_by": "Category Manager"
        # Missing sku_actions
    }
    response = client.post("/api/v1/assortment/submit", json=payload)
    assert response.status_code == 422
