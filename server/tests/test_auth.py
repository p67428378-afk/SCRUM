def test_register_and_login(client):
    # Test user registration
    register_payload = {
        "full_name": "New User",
        "email": "newuser@example.com",
        "password": "password123",
        "role": "PATRON",
    }
    response = client.post("/api/v1/auth/register", json=register_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "PATRON"

    # Test duplicate email registration
    dup_response = client.post("/api/v1/auth/register", json=register_payload)
    assert dup_response.status_code == 400

    # Test login
    login_payload = {"email": "newuser@example.com", "password": "password123"}
    login_response = client.post("/api/v1/auth/login", json=login_payload)
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data

    # Test /auth/me
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_response = client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "newuser@example.com"


def test_login_seeded_admin_and_patron(client):
    # Seeded admin login
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    assert admin_login.status_code == 200

    # Seeded test patron login
    patron_login = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert patron_login.status_code == 200
