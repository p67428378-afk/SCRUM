def test_seeded_user_login(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["role"] == "Devotee"


def test_admin_user_login(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "admin@example.com", "password": "adminpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "Admin"


def test_user_registration(client):
    reg_payload = {
        "email": "newdevotee@example.com",
        "phone": "9123456789",
        "password": "securepassword123",
        "full_name": "Ramesh Kumar",
        "preferred_language": "Gujarati",
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newdevotee@example.com"
    assert data["user"]["full_name"] == "Ramesh Kumar"


def test_duplicate_registration(client):
    reg_payload = {
        "email": "test@example.com",
        "phone": "9998887776",
        "password": "anotherpassword",
        "full_name": "Duplicate Devotee",
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 409


def test_invalid_password_login(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_get_my_profile(client, devotee_auth_headers):
    response = client.get("/api/v1/auth/me", headers=devotee_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
