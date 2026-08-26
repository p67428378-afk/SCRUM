def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_login_seeded_user(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newbuyer@example.com",
            "password": "newpassword123",
            "full_name": "New Buyer",
            "role": "buyer",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newbuyer@example.com"
    assert data["full_name"] == "New Buyer"
    assert "id" in data


def test_register_duplicate_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "somepassword",
            "full_name": "Duplicate User",
        },
    )
    assert response.status_code == 400


def test_get_me(client):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "test@example.com"
