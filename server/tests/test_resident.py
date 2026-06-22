"""
Module: tests.test_resident
Purpose: Test resident profile management
"""

from server.app.models.resident import Resident


def test_update_resident_profile_success(client, db):
    # AC: Resident Profile Management - Happy Path
    # Create a resident first
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
        "name": "Johnathan Doe",
        "email": "john.doe@example.com",
        "phone_number": "0987654321",
        "family_members": [
            {"name": "Jane Doe", "relationship": "Spouse", "phone_number": "5551234567"}
        ],
    }

    response = client.put("/api/v1/residents/res-123", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Johnathan Doe"
    assert data["email"] == "john.doe@example.com"
    assert data["phone_number"] == "0987654321"
    assert len(data["family_members"]) == 1
    assert data["family_members"][0]["name"] == "Jane Doe"
    assert data["family_members"][0]["relationship"] == "Spouse"


def test_update_resident_profile_not_found(client, db):
    # AC: Resident Profile Management - Resident Not Found
    payload = {
        "name": "Johnathan Doe",
        "email": "john.doe@example.com",
        "phone_number": "0987654321",
        "family_members": [],
    }
    response = client.put("/api/v1/residents/non-existent", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Resident not found"


def test_update_resident_profile_email_conflict(client, db):
    # AC: Resident Profile Management - Email Conflict
    res1 = Resident(
        id="res-1",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    res2 = Resident(
        id="res-2",
        name="Jane Smith",
        apartment_number="102",
        phone_number="0987654321",
        email="jane@example.com",
    )
    db.add(res1)
    db.add(res2)
    db.commit()

    payload = {
        "name": "Johnathan Doe",
        "email": "jane@example.com",  # Conflict with res2
        "phone_number": "1234567890",
        "family_members": [],
    }
    response = client.put("/api/v1/residents/res-1", json=payload)
    assert response.status_code == 400
    assert "Email already in use" in response.json()["detail"]
