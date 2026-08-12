from fastapi import status


def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "ok"


def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@example.com", "password": "newpassword123"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data


def test_get_me(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@example.com"
