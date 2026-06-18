from server.app.main import seed_demo_data
from server.app.models import Booking, Availability, Notification


def test_login_success(client, test_guide):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "tenzing@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["guide"]["email"] == "tenzing@example.com"
    assert data["guide"]["name"] == "Tenzing Norgay"


def test_login_invalid_credentials(client, test_guide):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "tenzing@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "password123"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_invalid_email(client):
    response = client.post(
        "/api/v1/auth/login", json={"email": "not-an-email", "password": "password123"}
    )
    assert response.status_code == 422


def test_demo_account_login_and_data(client, db_session):
    # Seed demo data manually for this test
    seed_demo_data()

    # Test login with demo credentials
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["guide"]["email"] == "test@example.com"
    assert data["guide"]["name"] == "Demo Guide"

    # Verify demo data exists in DB
    bookings = (
        db_session.query(Booking)
        .filter(Booking.guide_id == data["guide"]["guide_id"])
        .all()
    )
    assert len(bookings) == 4
    assert any(
        b.client_name == "Alice Smith" and b.trek_name == "Everest Base Camp"
        for b in bookings
    )

    availabilities = (
        db_session.query(Availability)
        .filter(Availability.guide_id == data["guide"]["guide_id"])
        .all()
    )
    assert len(availabilities) == 4

    notifications = (
        db_session.query(Notification)
        .filter(Notification.guide_id == data["guide"]["guide_id"])
        .all()
    )
    assert len(notifications) == 3
