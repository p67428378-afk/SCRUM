import os
import pytest
from fastapi.testclient import TestClient

# Set TESTING environment variable before importing app
os.environ["TESTING"] = "true"

from app.main import app
from app.database import Base, engine, SessionLocal
import app.models as models

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    # Re-create tables for each test to ensure isolation
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # Seed default attributes
    db = SessionLocal()
    try:
        categories = ["Ring", "Necklace", "Earring", "Bracelet"]
        for cat_name in categories:
            db.add(models.Category(name=cat_name))

        materials = ["Gold", "Silver", "Platinum"]
        for mat_name in materials:
            db.add(models.Material(name=mat_name))

        gemstones = ["Diamond", "Ruby", "Emerald", "Sapphire", "None"]
        for gem_name in gemstones:
            db.add(models.Gemstone(name=gem_name))

        db.commit()
    finally:
        db.close()

    yield


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "message": "Welcome to AuraJewel Inventory Management API"
    }


def test_create_inventory_item():
    payload = {
        "name": "Diamond Solitaire Ring",
        "category": "Ring",
        "material": "Gold",
        "gemstone_type": "Diamond",
        "carat_weight": 1.5,
        "price": 5000.0,
        "stock_quantity": 10,
        "low_stock_threshold": 3,
    }
    response = client.post("/api/v1/inventory", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Diamond Solitaire Ring"
    assert data["category"] == "Ring"
    assert data["material"] == "Gold"
    assert data["gemstone_type"] == "Diamond"
    assert data["carat_weight"] == 1.5
    assert data["price"] == 5000.0
    assert data["stock_quantity"] == 10
    assert data["low_stock_threshold"] == 3
    assert data["status"] == "in_stock"
    assert "id" in data


def test_get_inventory_item():
    # Create an item first
    payload = {
        "name": "Ruby Necklace",
        "category": "Necklace",
        "material": "Silver",
        "gemstone_type": "Ruby",
        "carat_weight": 2.5,
        "price": 3500.0,
        "stock_quantity": 2,
        "low_stock_threshold": 5,
    }
    create_resp = client.post("/api/v1/inventory", json=payload)
    item_id = create_resp.json()["id"]

    # Get the item
    response = client.get(f"/api/v1/inventory/{item_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Ruby Necklace"
    assert data["status"] == "low_stock"


def test_update_inventory_item():
    # Create an item first
    payload = {
        "name": "Emerald Studs",
        "category": "Earring",
        "material": "Platinum",
        "gemstone_type": "Emerald",
        "carat_weight": 1.0,
        "price": 1500.0,
        "stock_quantity": 5,
        "low_stock_threshold": 2,
    }
    create_resp = client.post("/api/v1/inventory", json=payload)
    item_id = create_resp.json()["id"]

    # Update the item
    update_payload = {
        "name": "Emerald Studs",
        "category": "Earring",
        "material": "Platinum",
        "gemstone_type": "Emerald",
        "carat_weight": 1.0,
        "price": 1800.0,
        "stock_quantity": 1,
        "low_stock_threshold": 2,
    }
    response = client.put(f"/api/v1/inventory/{item_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["price"] == 1800.0
    assert data["stock_quantity"] == 1
    assert data["status"] == "low_stock"


def test_delete_inventory_item():
    # Create an item first
    payload = {
        "name": "Gold Bracelet",
        "category": "Bracelet",
        "material": "Gold",
        "gemstone_type": "None",
        "carat_weight": None,
        "price": 1200.0,
        "stock_quantity": 4,
        "low_stock_threshold": 2,
    }
    create_resp = client.post("/api/v1/inventory", json=payload)
    item_id = create_resp.json()["id"]

    # Delete the item
    response = client.delete(f"/api/v1/inventory/{item_id}")
    assert response.status_code == 204

    # Verify it's gone
    get_resp = client.get(f"/api/v1/inventory/{item_id}")
    assert get_resp.status_code == 404


def test_search_and_filter_inventory():
    # Create multiple items
    items = [
        {
            "name": "Diamond Ring",
            "category": "Ring",
            "material": "Gold",
            "gemstone_type": "Diamond",
            "carat_weight": 1.0,
            "price": 3000.0,
            "stock_quantity": 10,
            "low_stock_threshold": 3,
        },
        {
            "name": "Silver Ring",
            "category": "Ring",
            "material": "Silver",
            "gemstone_type": "None",
            "carat_weight": None,
            "price": 200.0,
            "stock_quantity": 0,
            "low_stock_threshold": 2,
        },
        {
            "name": "Ruby Necklace",
            "category": "Necklace",
            "material": "Gold",
            "gemstone_type": "Ruby",
            "carat_weight": 2.0,
            "price": 8000.0,
            "stock_quantity": 1,
            "low_stock_threshold": 3,
        },
    ]
    for item in items:
        client.post("/api/v1/inventory", json=item)

    # Filter by category
    resp = client.get("/api/v1/inventory?category=Ring")
    assert resp.status_code == 200
    assert resp.json()["total"] == 2

    # Filter by status
    resp = client.get("/api/v1/inventory?status=out_of_stock")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
    assert resp.json()["items"][0]["name"] == "Silver Ring"

    # Search by name
    resp = client.get("/api/v1/inventory?search=Ruby")
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
    assert resp.json()["items"][0]["name"] == "Ruby Necklace"


def test_dashboard_stats():
    # Create items
    items = [
        {
            "name": "Diamond Ring",
            "category": "Ring",
            "material": "Gold",
            "gemstone_type": "Diamond",
            "carat_weight": 1.0,
            "price": 3000.0,
            "stock_quantity": 10,
            "low_stock_threshold": 3,
        },
        {
            "name": "Ruby Necklace",
            "category": "Necklace",
            "material": "Gold",
            "gemstone_type": "Ruby",
            "carat_weight": 2.0,
            "price": 8000.0,
            "stock_quantity": 1,
            "low_stock_threshold": 3,
        },
    ]
    for item in items:
        client.post("/api/v1/inventory", json=item)

    resp = client.get("/api/v1/dashboard/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_items"] == 2
    assert data["low_stock_count"] == 1  # Ruby Necklace has 1 stock, threshold 3
    assert data["out_of_stock_count"] == 0
    assert data["total_value"] == (3000.0 * 10) + (8000.0 * 1)


def test_audit_trail():
    # Create an item
    payload = {
        "name": "Diamond Ring",
        "category": "Ring",
        "material": "Gold",
        "gemstone_type": "Diamond",
        "carat_weight": 1.0,
        "price": 3000.0,
        "stock_quantity": 10,
        "low_stock_threshold": 3,
    }
    create_resp = client.post(
        "/api/v1/inventory", json=payload, headers={"X-User-ID": "test_user"}
    )
    item_id = create_resp.json()["id"]

    # Update the item
    update_payload = payload.copy()
    update_payload["price"] = 3200.0
    client.put(
        f"/api/v1/inventory/{item_id}",
        json=update_payload,
        headers={"X-User-ID": "test_user"},
    )

    # Delete the item
    client.delete(f"/api/v1/inventory/{item_id}", headers={"X-User-ID": "test_user"})

    # Get audit logs
    resp = client.get("/api/v1/audit-log")
    assert resp.status_code == 200
    logs = resp.json()["logs"]
    assert len(logs) >= 3
    actions = [log["action"] for log in logs]
    assert "CREATE" in actions
    assert "UPDATE" in actions
    assert "DELETE" in actions
    assert all(log["user_id"] == "test_user" for log in logs[:3])


def test_attributes():
    resp = client.get("/api/v1/attributes")
    assert resp.status_code == 200
    data = resp.json()
    assert "Ring" in data["categories"]
    assert "Diamond" in data["gemstones"]
    assert "Gold" in data["materials"]
