import pytest
from server.tests.conftest import client, TestingSessionLocal
from server.models.room import Room


@pytest.fixture
def auth_headers():
    # Create admin
    client.post(
        "/api/v1/users",
        json={
            "username": "admin_order@example.com",
            "password": "password123",
            "role": "Administrator",
        },
    )
    # Login admin
    login_resp = client.post(
        "/api/v1/auth/token",
        data={"username": "admin_order@example.com", "password": "password123"},
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def setup_data(auth_headers):
    # Create room
    db = TestingSessionLocal()
    room = Room(
        room_number="101",
        type="Standard",
        capacity=2,
        price_per_night=100.00,
        status="Available",
    )
    db.add(room)
    db.commit()
    db.refresh(room)

    # Create booking
    booking_resp = client.post(
        "/api/v1/bookings",
        json={
            "room_id": room.id,
            "guest_name": "John Doe",
            "check_in_date": "2026-08-01",
            "check_out_date": "2026-08-05",
        },
        headers=auth_headers,
    )
    booking_id = booking_resp.json()["id"]

    # Create restaurant
    restaurant_resp = client.post(
        "/api/v1/restaurants",
        json={
            "name": "Luigi's Pizzeria",
            "cuisine": "Italian",
            "address": "123 Main St",
        },
        headers=auth_headers,
    )
    restaurant_id = restaurant_resp.json()["id"]

    # Create menu item
    menu_item_resp = client.post(
        f"/api/v1/restaurants/{restaurant_id}/menu-items",
        json={
            "name": "Margherita Pizza",
            "description": "Classic pizza",
            "price": 12.99,
            "category": "Pizza",
        },
        headers=auth_headers,
    )
    menu_item_id = menu_item_resp.json()["id"]

    db.close()

    return {
        "booking_id": booking_id,
        "restaurant_id": restaurant_id,
        "menu_item_id": menu_item_id,
    }


def test_create_order_success(auth_headers, setup_data):
    response = client.post(
        "/api/v1/orders",
        json={
            "booking_id": setup_data["booking_id"],
            "restaurant_id": setup_data["restaurant_id"],
            "items": [{"menu_item_id": setup_data["menu_item_id"], "quantity": 2}],
            "notes": "Extra cheese please",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["booking_id"] == setup_data["booking_id"]
    assert data["restaurant_id"] == setup_data["restaurant_id"]
    assert float(data["total_price"]) == 25.98  # 12.99 * 2
    assert data["status"] == "Placed"
    assert data["notes"] == "Extra cheese please"
    assert len(data["items"]) == 1
    assert data["items"][0]["menu_item_id"] == setup_data["menu_item_id"]
    assert data["items"][0]["quantity"] == 2


def test_create_order_invalid_booking(auth_headers, setup_data):
    response = client.post(
        "/api/v1/orders",
        json={
            "booking_id": "00000000-0000-0000-0000-000000000000",
            "restaurant_id": setup_data["restaurant_id"],
            "items": [{"menu_item_id": setup_data["menu_item_id"], "quantity": 2}],
        },
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_create_order_invalid_restaurant(auth_headers, setup_data):
    response = client.post(
        "/api/v1/orders",
        json={
            "booking_id": setup_data["booking_id"],
            "restaurant_id": "00000000-0000-0000-0000-000000000000",
            "items": [{"menu_item_id": setup_data["menu_item_id"], "quantity": 2}],
        },
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_create_order_invalid_menu_item(auth_headers, setup_data):
    response = client.post(
        "/api/v1/orders",
        json={
            "booking_id": setup_data["booking_id"],
            "restaurant_id": setup_data["restaurant_id"],
            "items": [
                {"menu_item_id": "00000000-0000-0000-0000-000000000000", "quantity": 2}
            ],
        },
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_create_order_empty_items(auth_headers, setup_data):
    response = client.post(
        "/api/v1/orders",
        json={
            "booking_id": setup_data["booking_id"],
            "restaurant_id": setup_data["restaurant_id"],
            "items": [],
        },
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_get_orders(auth_headers, setup_data):
    # Create order
    client.post(
        "/api/v1/orders",
        json={
            "booking_id": setup_data["booking_id"],
            "restaurant_id": setup_data["restaurant_id"],
            "items": [{"menu_item_id": setup_data["menu_item_id"], "quantity": 2}],
        },
        headers=auth_headers,
    )

    response = client.get("/api/v1/orders", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["booking_id"] == setup_data["booking_id"]
    assert data[0]["restaurant"]["name"] == "Luigi's Pizzeria"
    assert data[0]["items"][0]["menu_item"]["name"] == "Margherita Pizza"


def test_get_order_by_id(auth_headers, setup_data):
    resp = client.post(
        "/api/v1/orders",
        json={
            "booking_id": setup_data["booking_id"],
            "restaurant_id": setup_data["restaurant_id"],
            "items": [{"menu_item_id": setup_data["menu_item_id"], "quantity": 2}],
        },
        headers=auth_headers,
    )
    order_id = resp.json()["id"]

    response = client.get(f"/api/v1/orders/{order_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == order_id


def test_update_order_status(auth_headers, setup_data):
    resp = client.post(
        "/api/v1/orders",
        json={
            "booking_id": setup_data["booking_id"],
            "restaurant_id": setup_data["restaurant_id"],
            "items": [{"menu_item_id": setup_data["menu_item_id"], "quantity": 2}],
        },
        headers=auth_headers,
    )
    order_id = resp.json()["id"]

    response = client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "In the Kitchen"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "In the Kitchen"


def test_update_order_status_invalid(auth_headers, setup_data):
    resp = client.post(
        "/api/v1/orders",
        json={
            "booking_id": setup_data["booking_id"],
            "restaurant_id": setup_data["restaurant_id"],
            "items": [{"menu_item_id": setup_data["menu_item_id"], "quantity": 2}],
        },
        headers=auth_headers,
    )
    order_id = resp.json()["id"]

    response = client.put(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "InvalidStatus"},
        headers=auth_headers,
    )
    assert response.status_code == 400
