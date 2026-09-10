def test_login_success_admin(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "ADMIN"
    assert data["token_type"] == "bearer"


def test_login_success_patron(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "PATRON"
    assert data["member_id"] is not None


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_register_patron(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newpatron@example.com",
            "password": "newpassword123",
            "full_name": "New Patron",
            "phone": "555-9876",
            "role": "PATRON",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newpatron@example.com"
    assert data["role"] == "PATRON"

    # Verify login with new user
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "newpatron@example.com", "password": "newpassword123"},
    )
    assert login_res.status_code == 200
    assert login_res.json()["email"] == "newpatron@example.com"


def test_register_duplicate_email(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@example.com",
            "password": "any",
            "full_name": "Duplicate Admin",
            "role": "PATRON",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_get_me(client, patron_headers):
    response = client.get("/api/v1/auth/me", headers=patron_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
