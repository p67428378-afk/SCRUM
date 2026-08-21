from fastapi import status


def test_register_user_success(client):
    # AC: Register a new user successfully
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new_user@example.com",
            "password": "securepassword",
            "full_name": "New User",
            "role": "buyer",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "new_user@example.com"
    assert data["full_name"] == "New User"
    assert data["role"] == "buyer"
    assert "id" in data


def test_register_user_duplicate_email(client):
    # AC: Registering with an already registered email returns 400
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "dup@example.com",
            "password": "password123",
            "full_name": "First User",
            "role": "buyer",
        },
    )
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "dup@example.com",
            "password": "password456",
            "full_name": "Second User",
            "role": "buyer",
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already registered" in response.json()["detail"]


def test_register_user_password_too_short(client):
    # AC: Password must be at least 6 characters
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "short@example.com",
            "password": "123",
            "full_name": "Short Password User",
            "role": "buyer",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_login_success(client):
    # AC: Login with correct credentials returns JWT token
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "password": "password123",
            "full_name": "Login User",
            "role": "seller",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "password123"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "login@example.com"


def test_login_incorrect_password(client):
    # AC: Login with incorrect password returns 401
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrong_pass@example.com",
            "password": "password123",
            "full_name": "Wrong Pass User",
            "role": "buyer",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "wrong_pass@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect email or password" in response.json()["detail"]
