"""
Module: tests.test_visitor
Purpose: Test visitor management
"""

from datetime import datetime, timedelta
from server.app.models.resident import Resident
from server.app.models.visitor import Visitor


def test_pre_approve_visitor_success(client, db):
    # AC: Visitor Management - Pre-approve Visitor Happy Path
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    db.add(res)
    db.commit()

    arrival_time = datetime.now() + timedelta(days=1)

    payload = {
        "resident_id": "res-123",
        "name": "Alice Johnson",
        "expected_arrival": arrival_time.isoformat(),
    }

    response = client.post("/api/v1/visitors/pre-approve", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["resident_id"] == "res-123"
    assert data["name"] == "Alice Johnson"
    assert data["status"] == "Expected"


def test_get_visitor_log(client, db):
    # AC: Visitor Management - Get Visitor Log
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    db.add(res)
    db.commit()

    vis = Visitor(
        id="vis-123",
        resident_id="res-123",
        name="Alice Johnson",
        expected_arrival=datetime.now() + timedelta(hours=2),
        status="Expected",
    )
    db.add(vis)
    db.commit()

    response = client.get("/api/v1/visitors/log?resident_id=res-123")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Alice Johnson"
    assert data[0]["status"] == "Expected"
