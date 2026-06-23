import pyotp
from server.app.auth import create_access_token


def test_login_success(client, test_student):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "alex.rivera@university.edu", "password": "securepassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["mfa_required"] is False


def test_login_invalid_credentials(client, test_student):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "alex.rivera@university.edu", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_mfa_required(client, test_student_mfa):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "mfa.student@university.edu", "password": "securepassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == ""
    assert data["mfa_required"] is True


def test_login_mfa_success(client, test_student_mfa):
    # Generate valid TOTP code
    totp = pyotp.TOTP(test_student_mfa.mfa_secret)
    mfa_code = totp.now()

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "mfa.student@university.edu",
            "password": "securepassword123",
            "mfa_code": mfa_code,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] != ""
    assert data["mfa_required"] is False


def test_login_mfa_invalid_code(client, test_student_mfa):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "mfa.student@university.edu",
            "password": "securepassword123",
            "mfa_code": "000000",
        },
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid MFA code"


def test_logout_success(client, test_student):
    token = create_access_token(data={"sub": test_student.email})
    response = client.post(
        "/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"


def test_logout_unauthorized(client):
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 401
