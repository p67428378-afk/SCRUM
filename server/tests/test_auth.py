import uuid


def test_seeded_users_login(client):
    """Verify test@example.com and admin@example.com can log in immediately."""
    # 1. Test cafe owner login
    res1 = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert "access_token" in data1
    assert data1["user"]["email"] == "test@example.com"
    assert data1["user"]["role"] == "cafe_owner"

    # 2. Test admin designer login
    res2 = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert "access_token" in data2
    assert data2["user"]["role"] == "designer"


def test_user_registration_and_login(client):
    """Test creating a new account and then logging in."""
    unique_email = f"newuser_{uuid.uuid4().hex[:6]}@example.com"
    reg_payload = {
        "email": unique_email,
        "password": "securepassword123",
        "full_name": "New Cafe Founder",
        "role": "cafe_owner",
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["email"] == unique_email
    assert user_data["role"] == "cafe_owner"

    # Login with new account
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": "securepassword123"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Verify /me endpoint
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email


def test_duplicate_registration_fails(client):
    """Registering with an existing email returns 400 Bad Request."""
    payload = {
        "email": "test@example.com",
        "password": "anotherpassword",
        "full_name": "Duplicate User",
        "role": "cafe_owner",
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()


def test_invalid_login_credentials(client):
    """Wrong password returns 401 Unauthorized."""
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert res.status_code == 401
