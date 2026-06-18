import pytest
from datetime import date
from server.app.models import Availability


@pytest.fixture(scope="function")
def seed_availability(db_session, test_guide):
    avail1 = Availability(
        availability_id="avail-1",
        guide_id=test_guide.guide_id,
        date=date(2026, 12, 12),
        is_available=True,
        notes="Available for short treks",
    )
    avail2 = Availability(
        availability_id="avail-2",
        guide_id=test_guide.guide_id,
        date=date(2026, 12, 13),
        is_available=False,
        notes="Rest day",
    )
    db_session.add_all([avail1, avail2])
    db_session.commit()
    return [avail1, avail2]


def test_get_availability_unauthorized(client):
    response = client.get("/api/v1/availability")
    assert response.status_code == 401


def test_get_availability_success(client, auth_headers, seed_availability):
    response = client.get("/api/v1/availability", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["availability_id"] == "avail-1"
    assert data[1]["availability_id"] == "avail-2"


def test_get_availability_filter_dates(client, auth_headers, seed_availability):
    response = client.get(
        "/api/v1/availability?start_date=2026-12-13&end_date=2026-12-14",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["availability_id"] == "avail-2"


def test_set_availability_create_new(client, auth_headers, db_session):
    response = client.post(
        "/api/v1/availability",
        headers=auth_headers,
        json={
            "dates": ["2026-12-20", "2026-12-21"],
            "is_available": True,
            "notes": "Holiday season",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["updated_count"] == 2

    # Verify in DB
    avails = db_session.query(Availability).all()
    assert len(avails) == 2
    assert avails[0].date == date(2026, 12, 20)
    assert avails[1].date == date(2026, 12, 21)


def test_set_availability_date_range(client, auth_headers, db_session):
    response = client.post(
        "/api/v1/availability",
        headers=auth_headers,
        json={
            "start_date": "2026-12-25",
            "end_date": "2026-12-27",
            "is_available": False,
            "notes": "Christmas break",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["updated_count"] == 3

    # Verify in DB
    avails = db_session.query(Availability).order_by(Availability.date).all()
    assert len(avails) == 3
    assert avails[0].date == date(2026, 12, 25)
    assert avails[1].date == date(2026, 12, 26)
    assert avails[2].date == date(2026, 12, 27)


def test_set_availability_update_existing(
    client, auth_headers, seed_availability, db_session
):
    response = client.post(
        "/api/v1/availability",
        headers=auth_headers,
        json={
            "dates": ["2026-12-12"],
            "is_available": False,
            "notes": "Changed mind, need rest",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["updated_count"] == 1

    # Verify in DB
    avail = (
        db_session.query(Availability)
        .filter(Availability.date == date(2026, 12, 12))
        .first()
    )
    assert avail.is_available is False
    assert avail.notes == "Changed mind, need rest"


def test_set_availability_empty_dates(client, auth_headers):
    response = client.post(
        "/api/v1/availability", headers=auth_headers, json={"is_available": True}
    )
    assert response.status_code == 400
    assert (
        "Either dates or start_date and end_date must be provided"
        in response.json()["detail"]
    )


def test_set_availability_invalid_range(client, auth_headers):
    response = client.post(
        "/api/v1/availability",
        headers=auth_headers,
        json={
            "start_date": "2026-12-28",
            "end_date": "2026-12-25",
            "is_available": True,
        },
    )
    assert response.status_code == 400
    assert "start_date cannot be after end_date" in response.json()["detail"]
