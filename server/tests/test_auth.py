def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newresident@example.com",
            "password": "securepassword",
            "full_name": "Jane Resident",
            "role": "Resident",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newresident@example.com"
