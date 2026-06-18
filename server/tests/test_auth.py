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
