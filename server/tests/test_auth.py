from server.tests.conftest import client


def test_create_user_and_login():
    # Create user
    response = client.post(
        "/api/v1/users",
        json={
            "username": "admin@example.com",
            "password": "password123",
            "role": "Administrator",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "admin@example.com"
    assert data["role"] == "Administrator"

    # Login
    response = client.post(
        "/api/v1/auth/token",
        data={"username": "admin@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "admin@example.com"
    assert data["user"]["role"] == "Administrator"


def test_login_invalid_credentials():
    response = client.post(
        "/api/v1/auth/token",
        data={"username": "nonexistent@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials provided"


def test_change_user_role():
    # Create admin
    client.post(
        "/api/v1/users",
        json={
            "username": "admin@example.com",
            "password": "password123",
            "role": "Administrator",
        },
    )
    # Login admin
    login_resp = client.post(
        "/api/v1/auth/token",
        data={"username": "admin@example.com", "password": "password123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create receptionist
    user_resp = client.post(
        "/api/v1/users",
        json={
            "username": "staff@example.com",
            "password": "password123",
            "role": "Receptionist",
        },
    )
    user_id = user_resp.json()["id"]

    # Change role to Manager
    response = client.put(
        f"/api/v1/users/{user_id}/role", json={"role": "Manager"}, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["role"] == "Manager"
