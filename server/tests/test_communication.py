"""
Module: tests.test_communication
Purpose: Test communication and announcements
"""

from server.app.models.resident import Resident
from server.app.models.communication import Announcement, Discussion


def test_get_announcements(client, db):
    # AC: Communication and Announcements - Get Announcements
    ann = Announcement(
        id="ann-123", title="Annual General Meeting", content="Meeting on June 30th"
    )
    db.add(ann)
    db.commit()

    response = client.get("/api/v1/announcements")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Annual General Meeting"
    assert data[0]["content"] == "Meeting on June 30th"


def test_get_discussions(client, db):
    # AC: Communication and Announcements - Get Discussions
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    db.add(res)
    db.commit()

    disc = Discussion(
        id="disc-123",
        resident_id="res-123",
        title="Parking Issue",
        content="Someone parked in my spot",
    )
    db.add(disc)
    db.commit()

    response = client.get("/api/v1/discussions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Parking Issue"
    assert data[0]["resident_name"] == "John Doe"
    assert data[0]["comments_count"] == 0


def test_post_comment_success(client, db):
    # AC: Communication and Announcements - Post Comment Happy Path
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    db.add(res)
    db.commit()

    disc = Discussion(
        id="disc-123",
        resident_id="res-123",
        title="Parking Issue",
        content="Someone parked in my spot",
    )
    db.add(disc)
    db.commit()

    payload = {"content": "I agree, this is a major issue.", "resident_id": "res-123"}

    response = client.post("/api/v1/discussions/disc-123/comments", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "I agree, this is a major issue."
    assert data["resident_name"] == "John Doe"
    assert data["discussion_id"] == "disc-123"


def test_post_comment_discussion_not_found(client, db):
    # AC: Communication and Announcements - Discussion Not Found
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    db.add(res)
    db.commit()

    payload = {"content": "I agree, this is a major issue.", "resident_id": "res-123"}

    response = client.post("/api/v1/discussions/non-existent/comments", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Discussion not found"
