from fastapi import status
from server.auth import failed_attempts


def test_register_user_success(client):
    # AC: Users must be able to log in securely using a unique username and a strong password.
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "StrongPassword123!",
            "phone_number": "+15559998888",
            "full_name": "New User",
            "address": "456 New St, New York, NY 10002",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"


def test_register_user_weak_password(client):
    # AC: Users must be able to log in securely using a unique username and a strong password.
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "weakuser",
            "email": "weakuser@example.com",
            "password": "weak",
            "phone_number": "+15559998888",
            "full_name": "Weak User",
            "address": "456 New St, New York, NY 10002",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_login_and_mfa_flow(client):
    # AC: The system will include multi-factor authentication (MFA) for enhanced security.
    # 1. Login
    response = client.post(
        "/api/v1/auth/login", json={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["user"]["mfa_required"] is True
    user_id = data["user"]["id"]

    # 2. Send MFA Code
    response = client.post("/api/v1/auth/mfa/send-code", json={"user_id": user_id})
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["detail"] == "MFA code sent successfully."

    # 3. Verify MFA Code
    response = client.post(
        "/api/v1/auth/mfa/verify-code", json={"user_id": user_id, "code": "123456"}
    )
    assert response.status_code == status.HTTP_200_OK
    verify_data = response.json()
    assert "access_token" in verify_data
    assert verify_data["user"]["mfa_required"] is False


def test_account_lockout_after_5_failures(client):
    # AC: Account Lockout: Accounts will be temporarily locked for 30 minutes after 5 consecutive failed login attempts.
    # Clear failed attempts first
    failed_attempts.clear()

    for _ in range(5):
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "testuser", "password": "wrongpassword"},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # 6th attempt should be locked (403)
    response = client.post(
        "/api/v1/auth/login", json={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "locked" in response.json()["detail"].lower()

    # Clean up
    failed_attempts.clear()


def test_logout(client):
    # AC: Session Management: User sessions will automatically time out after 15 minutes of inactivity.
    # 1. Login and verify MFA to get token
    login_resp = client.post(
        "/api/v1/auth/login", json={"username": "testuser", "password": "testpassword"}
    )
    user_id = login_resp.json()["user"]["id"]
    client.post("/api/v1/auth/mfa/send-code", json={"user_id": user_id})
    verify_resp = client.post(
        "/api/v1/auth/mfa/verify-code", json={"user_id": user_id, "code": "123456"}
    )
    token = verify_resp.json()["access_token"]

    # 2. Logout
    logout_resp = client.post(
        "/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"}
    )
    assert logout_resp.status_code == status.HTTP_200_OK
    assert logout_resp.json()["detail"] == "Successfully logged out."
