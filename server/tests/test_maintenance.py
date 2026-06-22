"""
Module: tests.test_maintenance
Purpose: Test maintenance request submission and tracking
"""

from server.app.models.resident import Resident
from server.app.models.maintenance import MaintenanceRequest


def test_create_maintenance_request_success(client, db):
    # AC: Maintenance Request Submission and Tracking - Happy Path
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    db.add(res)
    db.commit()

    payload = {
        "category": "Plumbing",
        "description": "Leaking pipe in kitchen",
        "priority": "High",
        "resident_id": "res-123",
        "image_url": "http://example.com/image.jpg",
    }

    response = client.post("/api/v1/maintenance-requests", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["category"] == "Plumbing"
    assert data["description"] == "Leaking pipe in kitchen"
    assert data["priority"] == "High"
    assert data["resident_id"] == "res-123"
    assert data["status"] == "Pending"


def test_create_maintenance_request_missing_fields(client, db):
    # AC: Maintenance Request Submission and Tracking - Missing Fields
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    db.add(res)
    db.commit()

    payload = {
        "category": "",
        "description": "Leaking pipe",
        "priority": "High",
        "resident_id": "res-123",
    }
    response = client.post("/api/v1/maintenance-requests", json=payload)
    assert response.status_code == 400
    assert "Missing required fields" in response.json()["detail"]


def test_get_maintenance_request_success(client, db):
    # AC: Maintenance Request Submission and Tracking - Get Details
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    db.add(res)
    db.commit()

    req = MaintenanceRequest(
        id="req-123",
        resident_id="res-123",
        category="Electrical",
        description="Flickering lights",
        priority="Medium",
        status="Pending",
    )
    db.add(req)
    db.commit()

    response = client.get("/api/v1/maintenance-requests/req-123")
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Electrical"
    assert data["description"] == "Flickering lights"
    assert data["status"] == "Pending"


def test_get_maintenance_request_not_found(client, db):
    # AC: Maintenance Request Submission and Tracking - Request Not Found
    response = client.get("/api/v1/maintenance-requests/non-existent")
    assert response.status_code == 404
    assert response.json()["detail"] == "Request not found"
