import pytest
from server.tests.conftest import client, TestingSessionLocal
from server.models.room import Room


@pytest.fixture
def auth_headers():
    # Create admin
    client.post(
        "/api/v1/users",
        json={
            "username": "admin@example.com",
            "password": "password123",
            "role": "Administrator",
        },
    )
    # Login admin
    login_resp = client.post(
        "/api/v1/auth/token",
        data={"username": "admin@example.com", "password": "password123"},
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_rooms_empty(auth_headers):
    response = client.get("/api/v1/rooms", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_update_room_status(auth_headers):
    # Seed a room directly
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
    room_id = room.id
    db.close()

    # Update status to Dirty
    response = client.put(
        f"/api/v1/rooms/{room_id}/status",
        json={"status": "Dirty"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Dirty"

    # Verify status in list
    response = client.get("/api/v1/rooms", headers=auth_headers)
    assert len(response.json()) == 1
    assert response.json()[0]["status"] == "Dirty"


def test_update_room_status_invalid(auth_headers):
    # Seed a room directly
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
    room_id = room.id
    db.close()

    # Update status to invalid value
    response = client.put(
        f"/api/v1/rooms/{room_id}/status",
        json={"status": "InvalidStatus"},
        headers=auth_headers,
    )
    assert response.status_code == 400
