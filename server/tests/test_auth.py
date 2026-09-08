def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newresident@example.com",
            "password": "password123",
            "full_name": "New Resident",
            "phone": "+15559998888",
            "household_address": "House #99",
            "role": "Resident",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newresident@example.com"
    assert data["role"] == "Resident"


def test_register_duplicate_email(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "anotherpassword",
            "full_name": "Duplicate User",
            "role": "Resident",
        },
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Email address already registered"


def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"


def test_login_wrong_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_get_current_user_me(client, resident_headers):
    response = client.get("/api/v1/auth/me", headers=resident_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
