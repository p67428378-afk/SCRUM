def test_login_success_member(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["role"] == "Member"


def test_login_success_librarian(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Librarian"


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_register_new_user(client):
    payload = {
        "email": "newuser@example.com",
        "password": "password123",
        "full_name": "New User",
        "role": "Member",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "Member"


def test_register_duplicate_email(client):
    payload = {
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Duplicate User",
        "role": "Member",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400


def test_get_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_get_me_success(client, member_headers):
    response = client.get("/api/v1/auth/me", headers=member_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
