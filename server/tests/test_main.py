def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "message" in data


def test_health_check_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "book-website-api"


def test_user_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"


def test_user_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_user_registration(client):
    new_email = "newuser@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={"email": new_email, "password": "password123", "full_name": "New Tester"},
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == new_email


def test_user_registration_duplicate_email(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Duplicate Tester",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_get_current_user_profile(client, user_headers):
    response = client.get("/api/v1/auth/me", headers=user_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["is_active"] is True
