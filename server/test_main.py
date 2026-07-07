import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .database import Base, get_db
from .main import app
from . import models

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # Seed the test database session
    kpi = models.KPI(
        sales_per_linear_ft=15.75,
        private_brand_pct=24.5,
        in_stock_rate=98.2,
        shelf_capacity=88.0,
        sales_trend_pct=4.2,
        private_brand_status="Warning",
        in_stock_status="Healthy",
    )
    session.add(kpi)

    skus = [
        models.SKU(
            sku="SKU-8821",
            name="Clover Valley Potato Chips 10oz",
            sales=42500,
            units=17000,
            profit=14875,
            status="GROW",
        ),
        models.SKU(
            sku="SKU-4412",
            name="Lay's Classic Potato Chips 13oz",
            sales=38200,
            units=11200,
            profit=9550,
            status="MAINTAIN",
        ),
        models.SKU(
            sku="SKU-9012",
            name="Clover Valley Cheese Curls 8oz",
            sales=12400,
            units=6200,
            profit=3100,
            status="SWAP",
        ),
        models.SKU(
            sku="SKU-3115",
            name="Doritos Nacho Cheese 9.25oz",
            sales=31000,
            units=8800,
            profit=7750,
            status="MAINTAIN",
        ),
        models.SKU(
            sku="SKU-1104",
            name="Generic Tortilla Strips 16oz",
            sales=4100,
            units=1500,
            profit=820,
            status="REDUCE",
        ),
    ]
    session.add_all(skus)

    scenarios = [
        models.Scenario(
            name="Conservative",
            projected_sales=1.2,
            projected_private_brand_pct=22.0,
            grow_count=20,
            maintain_count=60,
            swap_count=10,
            reduce_count=10,
            shelf_capacity_status="OK",
            pb_penetration_status="MET",
        ),
        models.Scenario(
            name="Balanced",
            projected_sales=4.8,
            projected_private_brand_pct=25.2,
            grow_count=40,
            maintain_count=30,
            swap_count=15,
            reduce_count=15,
            shelf_capacity_status="OK",
            pb_penetration_status="MET",
        ),
        models.Scenario(
            name="Aggressive",
            projected_sales=8.5,
            projected_private_brand_pct=30.1,
            grow_count=60,
            maintain_count=10,
            swap_count=20,
            reduce_count=10,
            shelf_capacity_status="OK",
            pb_penetration_status="MET",
        ),
    ]
    session.add_all(scenarios)
    session.commit()

    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_get_kpis(client):
    response = client.get("/api/v1/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "sales_per_linear_ft" in data
    assert data["sales_per_linear_ft"] == 15.75


def test_get_skus(client):
    response = client.get("/api/v1/skus")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["sku"] == "SKU-8821"


def test_select_scenario_valid(client):
    response = client.post("/api/v1/scenarios", json={"scenario": "Balanced"})
    assert response.status_code == 200
    data = response.json()
    assert data["scenario"] == "Balanced"
    assert data["projected_sales"] == 4.8


def test_select_scenario_invalid(client):
    response = client.post("/api/v1/scenarios", json={"scenario": "NonExistent"})
    assert response.status_code == 400


def test_submit_review_valid(client):
    response = client.post("/api/v1/reviews", json={"scenario": "Balanced"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["approved_scenario"] == "Balanced"
    assert "audit_trail" in data


def test_submit_review_invalid(client):
    response = client.post("/api/v1/reviews", json={"scenario": "NonExistent"})
    assert response.status_code == 400
