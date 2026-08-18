def test_register_and_login_user(client):
    email = "newuser@example.com"
    password = "securepassword123"

    # Register
    reg_response = client.post("/api/v1/users/register", json={
        "email": email,
        "password": password,
        "full_name": "New User"
    })
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == email
    assert user_data["full_name"] == "New User"

    # Duplicate registration error
    dup_response = client.post("/api/v1/users/register", json={
        "email": email,
        "password": password
    })
    assert dup_response.status_code == 400

    # Login
    login_response = client.post("/api/v1/users/login", json={
        "email": email,
        "password": password
    })
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data

    # Profile
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    profile_response = client.get("/api/v1/users/profile", headers=headers)
    assert profile_response.status_code == 200
    profile_data = profile_response.json()
    assert profile_data["email"] == email


def test_seeded_user_login(client):
    # Test pre-seeded user login
    login_response = client.post("/api/v1/users/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
