def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_register_and_read_me(client):
    register_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "newpassword123",
            "full_name": "New User",
            "role": "staff",
        },
    )
    assert register_res.status_code == 201
    user_data = register_res.json()
    assert user_data["email"] == "newuser@example.com"

    # Login to get token
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "newuser@example.com", "password": "newpassword123"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Read /me
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "newuser@example.com"
