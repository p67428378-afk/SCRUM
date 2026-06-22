"""
Module: tests.test_facility
Purpose: Test facility booking
"""

from datetime import datetime, timedelta
from server.app.models.resident import Resident
from server.app.models.facility import Facility, Booking


def test_get_facilities(client, db):
    # AC: Facility Booking - Get Facilities
    fac = Facility(
        id="fac-123",
        name="Gym",
        description="Fully equipped gym",
        capacity=20,
        rate=5.00,
    )
    db.add(fac)
    db.commit()

    response = client.get("/api/v1/facilities")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Gym"
    assert data[0]["capacity"] == 20


def test_get_facility_availability(client, db):
    # AC: Facility Booking - Get Availability
    fac = Facility(
        id="fac-123",
        name="Gym",
        description="Fully equipped gym",
        capacity=20,
        rate=5.00,
    )
    db.add(fac)
    db.commit()

    response = client.get("/api/v1/facilities/fac-123/availability?date=2026-06-22")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["available"] is True


def test_book_facility_success(client, db):
    # AC: Facility Booking - Book Facility Happy Path
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    fac = Facility(
        id="fac-123",
        name="Gym",
        description="Fully equipped gym",
        capacity=20,
        rate=5.00,
    )
    db.add(res)
    db.add(fac)
    db.commit()

    start_time = datetime.now() + timedelta(days=1)
    end_time = start_time + timedelta(hours=2)

    payload = {
        "facility_id": "fac-123",
        "resident_id": "res-123",
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "purpose": "Workout",
    }

    response = client.post("/api/v1/bookings", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["facility_id"] == "fac-123"
    assert data["resident_id"] == "res-123"
    assert data["status"] == "Confirmed"


def test_book_facility_double_booking(client, db):
    # AC: Facility Booking - Double Booking Prevention
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    fac = Facility(
        id="fac-123",
        name="Gym",
        description="Fully equipped gym",
        capacity=20,
        rate=5.00,
    )
    db.add(res)
    db.add(fac)
    db.commit()

    start_time = datetime.now() + timedelta(days=1)
    end_time = start_time + timedelta(hours=2)

    booking = Booking(
        id="book-123",
        facility_id="fac-123",
        resident_id="res-123",
        start_time=start_time,
        end_time=end_time,
        purpose="Workout",
        status="Confirmed",
    )
    db.add(booking)
    db.commit()

    # Try to book overlapping slot
    payload = {
        "facility_id": "fac-123",
        "resident_id": "res-123",
        "start_time": (start_time + timedelta(hours=1)).isoformat(),
        "end_time": (end_time + timedelta(hours=1)).isoformat(),
        "purpose": "Workout 2",
    }

    response = client.post("/api/v1/bookings", json=payload)
    assert response.status_code == 400
    assert "Double booking or invalid time slot" in response.json()["detail"]
