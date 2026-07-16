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


@pytest.fixture
def seeded_room():
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
    return room_id


def test_create_booking_success(auth_headers, seeded_room):
    response = client.post(
        "/api/v1/bookings",
        json={
            "room_id": seeded_room,
            "guest_name": "John Doe",
            "check_in_date": "2026-08-01",
            "check_out_date": "2026-08-05",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["guest_name"] == "John Doe"
    assert data["total_amount"] == 400.00  # 4 nights * 100.00


def test_create_booking_double_booking(auth_headers, seeded_room):
    # Create first booking
    client.post(
        "/api/v1/bookings",
        json={
            "room_id": seeded_room,
            "guest_name": "John Doe",
            "check_in_date": "2026-08-01",
            "check_out_date": "2026-08-05",
        },
        headers=auth_headers,
    )

    # Try to create overlapping booking
    response = client.post(
        "/api/v1/bookings",
        json={
            "room_id": seeded_room,
            "guest_name": "Jane Smith",
            "check_in_date": "2026-08-03",
            "check_out_date": "2026-08-07",
        },
        headers=auth_headers,
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Room is already booked for the selected dates"


def test_cancel_booking(auth_headers, seeded_room):
    # Create booking
    booking_resp = client.post(
        "/api/v1/bookings",
        json={
            "room_id": seeded_room,
            "guest_name": "John Doe",
            "check_in_date": "2026-08-01",
            "check_out_date": "2026-08-05",
        },
        headers=auth_headers,
    )
    booking_id = booking_resp.json()["id"]

    # Cancel booking
    response = client.delete(f"/api/v1/bookings/{booking_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Booking cancelled successfully"
