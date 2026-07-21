import pytest
from server.tests.conftest import client


@pytest.fixture
def admin_headers():
    # Create admin
    client.post(
        "/api/v1/users",
        json={
            "username": "admin_test@example.com",
            "password": "password123",
            "role": "Administrator",
        },
    )
    # Login admin
    login_resp = client.post(
        "/api/v1/auth/token",
        data={"username": "admin_test@example.com", "password": "password123"},
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def receptionist_headers():
    # Create receptionist
    client.post(
        "/api/v1/users",
        json={
            "username": "receptionist_test@example.com",
            "password": "password123",
            "role": "Receptionist",
        },
    )
    # Login receptionist
    login_resp = client.post(
        "/api/v1/auth/token",
        data={"username": "receptionist_test@example.com", "password": "password123"},
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_restaurant_admin(admin_headers):
    response = client.post(
        "/api/v1/restaurants",
        json={
            "name": "Luigi's Pizzeria",
            "cuisine": "Italian",
            "address": "123 Main St",
            "phone_number": "555-1234",
            "operating_hours": "11 AM - 10 PM",
        },
        headers=admin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Luigi's Pizzeria"
    assert data["cuisine"] == "Italian"
    assert "id" in data


def test_create_restaurant_receptionist_forbidden(receptionist_headers):
    response = client.post(
        "/api/v1/restaurants",
        json={
            "name": "Luigi's Pizzeria",
            "cuisine": "Italian",
            "address": "123 Main St",
            "phone_number": "555-1234",
            "operating_hours": "11 AM - 10 PM",
        },
        headers=receptionist_headers,
    )
    assert response.status_code == 403


def test_get_restaurants(admin_headers):
    # Create a restaurant
    client.post(
        "/api/v1/restaurants",
        json={
            "name": "Luigi's Pizzeria",
            "cuisine": "Italian",
            "address": "123 Main St",
        },
        headers=admin_headers,
    )

    response = client.get("/api/v1/restaurants", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(r["name"] == "Luigi's Pizzeria" for r in data)


def test_get_restaurant_by_id(admin_headers):
    resp = client.post(
        "/api/v1/restaurants",
        json={
            "name": "Luigi's Pizzeria",
            "cuisine": "Italian",
            "address": "123 Main St",
        },
        headers=admin_headers,
    )
    restaurant_id = resp.json()["id"]

    response = client.get(f"/api/v1/restaurants/{restaurant_id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Luigi's Pizzeria"


def test_create_menu_item_admin(admin_headers):
    resp = client.post(
        "/api/v1/restaurants",
        json={
            "name": "Luigi's Pizzeria",
            "cuisine": "Italian",
            "address": "123 Main St",
        },
        headers=admin_headers,
    )
    restaurant_id = resp.json()["id"]

    response = client.post(
        f"/api/v1/restaurants/{restaurant_id}/menu-items",
        json={
            "name": "Margherita Pizza",
            "description": "Classic pizza",
            "price": 12.99,
            "category": "Pizza",
        },
        headers=admin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Margherita Pizza"
    assert float(data["price"]) == 12.99


def test_create_menu_item_receptionist_forbidden(admin_headers, receptionist_headers):
    resp = client.post(
        "/api/v1/restaurants",
        json={
            "name": "Luigi's Pizzeria",
            "cuisine": "Italian",
            "address": "123 Main St",
        },
        headers=admin_headers,
    )
    restaurant_id = resp.json()["id"]

    response = client.post(
        f"/api/v1/restaurants/{restaurant_id}/menu-items",
        json={
            "name": "Margherita Pizza",
            "description": "Classic pizza",
            "price": 12.99,
            "category": "Pizza",
        },
        headers=receptionist_headers,
    )
    assert response.status_code == 403


def test_get_menu_items(admin_headers):
    resp = client.post(
        "/api/v1/restaurants",
        json={
            "name": "Luigi's Pizzeria",
            "cuisine": "Italian",
            "address": "123 Main St",
        },
        headers=admin_headers,
    )
    restaurant_id = resp.json()["id"]

    client.post(
        f"/api/v1/restaurants/{restaurant_id}/menu-items",
        json={
            "name": "Margherita Pizza",
            "description": "Classic pizza",
            "price": 12.99,
            "category": "Pizza",
        },
        headers=admin_headers,
    )

    response = client.get(
        f"/api/v1/restaurants/{restaurant_id}/menu-items", headers=admin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Margherita Pizza"
