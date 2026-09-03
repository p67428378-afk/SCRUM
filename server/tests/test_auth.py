def test_register_user_success(client):
    payload = {
        "email": "newcafe@example.com",
        "full_name": "Sarah Connor",
        "password": "secretpassword123",
        "role": "owner",
        "bio": "Opening a new artisanal bakery cafe.",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newcafe@example.com"
    assert data["user"]["role"] == "owner"


def test_register_duplicate_email_fails(client):
    payload = {
        "email": "test@example.com",
        "full_name": "Duplicate User",
        "password": "password123",
        "role": "owner",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


def test_login_success(client):
    payload = {
        "email": "test@example.com",
        "password": "testpassword",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


def test_login_wrong_password_fails(client):
    payload = {
        "email": "test@example.com",
        "password": "wrongpassword",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


def test_get_me_authenticated(client, owner_headers):
    response = client.get("/api/v1/auth/me", headers=owner_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["role"] == "owner"


def test_get_me_unauthenticated(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_list_designers(client):
    response = client.get("/api/v1/auth/designers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(d["email"] == "designer@example.com" for d in data)
