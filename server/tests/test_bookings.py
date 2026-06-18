import pytest
from datetime import date
from server.app.models import Booking, Notification


@pytest.fixture(scope="function")
def seed_bookings(db_session, test_guide):
    booking1 = Booking(
        booking_id="booking-1",
        guide_id=test_guide.guide_id,
        client_name="Alice Smith",
        client_contact="alice@example.com",
        trek_name="Everest Base Camp",
        trek_date=date(2026, 12, 12),
        participants=3,
        payment_status="Paid",
        status="Confirmed",
    )
    booking2 = Booking(
        booking_id="booking-2",
        guide_id=test_guide.guide_id,
        client_name="Mark Evans",
        client_contact="mark@example.com",
        trek_name="Annapurna Circuit",
        trek_date=date(2026, 12, 15),
        participants=2,
        payment_status="Pending",
        status="Pending",
    )
    db_session.add_all([booking1, booking2])
    db_session.commit()
    return [booking1, booking2]


def test_get_bookings_unauthorized(client):
    response = client.get("/api/v1/bookings")
    assert response.status_code == 401


def test_get_bookings_success(client, auth_headers, seed_bookings):
    response = client.get("/api/v1/bookings", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["booking_id"] == "booking-1"
    assert data[1]["booking_id"] == "booking-2"


def test_get_bookings_filter_status(client, auth_headers, seed_bookings):
    response = client.get("/api/v1/bookings?status=Pending", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["booking_id"] == "booking-2"


def test_get_booking_details_success(client, auth_headers, seed_bookings):
    response = client.get("/api/v1/bookings/booking-1", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["client_name"] == "Alice Smith"
    assert data["trek_name"] == "Everest Base Camp"


def test_get_booking_details_not_found(client, auth_headers, seed_bookings):
    response = client.get("/api/v1/bookings/nonexistent", headers=auth_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Booking not found"


def test_create_booking_success(client, auth_headers, db_session):
    response = client.post(
        "/api/v1/bookings",
        headers=auth_headers,
        json={
            "client_name": "John Doe",
            "client_contact": "john@example.com",
            "trek_name": "Manaslu Circuit",
            "trek_date": "2026-12-20",
            "participants": 2,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["client_name"] == "John Doe"
    assert data["trek_name"] == "Manaslu Circuit"
    assert data["status"] == "Pending"
    assert data["payment_status"] == "Pending"

    # Verify notification was created
    notifications = db_session.query(Notification).all()
    assert len(notifications) == 1
    assert "New booking request from John Doe" in notifications[0].message


def test_update_booking_success(client, auth_headers, seed_bookings, db_session):
    response = client.put(
        "/api/v1/bookings/booking-2",
        headers=auth_headers,
        json={
            "status": "Confirmed",
            "payment_status": "Paid",
            "participants": 4,
            "client_name": "Mark Evans Jr.",
            "client_contact": "mark.jr@example.com",
            "trek_name": "Annapurna Sanctuary",
            "trek_date": "2026-12-16",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Confirmed"
    assert data["payment_status"] == "Paid"
    assert data["participants"] == 4
    assert data["client_name"] == "Mark Evans Jr."
    assert data["client_contact"] == "mark.jr@example.com"
    assert data["trek_name"] == "Annapurna Sanctuary"
    assert data["trek_date"] == "2026-12-16"

    # Verify notification was created
    notifications = db_session.query(Notification).all()
    assert len(notifications) == 1
    assert "booking-2" in notifications[0].message
    assert "status changed to Confirmed" in notifications[0].message


def test_update_booking_invalid_participants(client, auth_headers, seed_bookings):
    response = client.put(
        "/api/v1/bookings/booking-2", headers=auth_headers, json={"participants": 0}
    )
    assert response.status_code == 400
    assert "Participants must be greater than 0" in response.json()["detail"]
