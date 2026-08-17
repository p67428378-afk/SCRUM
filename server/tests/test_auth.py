from fastapi import status


def test_register_user(client):
    # AC: Register a new user successfully
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "newpassword",
            "full_name": "New User",
            "role": "Employee",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert data["role"] == "Employee"
    assert "id" in data


def test_register_duplicate_email(client):
    # AC: Registering with an existing email returns 400
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "dup@example.com",
            "password": "password",
            "full_name": "Dup User",
            "role": "Employee",
        },
    )
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "dup@example.com",
            "password": "password",
            "full_name": "Dup User",
            "role": "Employee",
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Email already registered."


def test_login_success(client):
    # AC: Login with correct credentials returns JWT token
    # First register a user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "password": "correctpassword",
            "full_name": "Login User",
            "role": "Employee",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "correctpassword"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login@example.com"


def test_login_failure(client):
    # AC: Login with incorrect credentials returns 401
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Incorrect email or password"


def test_get_me(client):
    # AC: Get current user profile with valid token
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "me@example.com",
            "password": "mypassword",
            "full_name": "Me User",
            "role": "Employee",
        },
    )
    login_resp = client.post(
        "/api/v1/auth/login", json={"email": "me@example.com", "password": "mypassword"}
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["email"] == "me@example.com"
