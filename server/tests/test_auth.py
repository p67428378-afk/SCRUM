def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_register_new_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "actor.new@example.com",
            "password": "newpassword123",
            "full_name": "Jane Actor",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "actor.new@example.com"
    assert data["profile"]["full_name"] == "Jane Actor"
    assert data["profile"]["slug"] == "jane-actor"


def test_get_me(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "test@example.com"
    assert data["profile"]["full_name"] == "John Doe"
