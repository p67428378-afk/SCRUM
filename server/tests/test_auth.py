def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"


def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "test@example.com"
    assert data["role"] == "Front Desk Staff"


def test_login_json_success(client):
    response = client.post(
        "/api/v1/auth/login/json",
        json={"username": "admin@example.com", "password": "adminpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "Admin"


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_get_me(client, staff_auth_headers):
    response = client.get("/api/v1/auth/me", headers=staff_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
