from server.models import User, MFACode, AuditLog


def test_register_success(client, db_session):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "account_number": "123456789",
            "password": "SecurePassword123!",
            "ssn": "999-99-9999",
            "username": "newuser@example.com",
            "security_question": "What was the name of your first pet?",
            "security_answer": "Fluffy",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "user_id" in data
    assert data["message"] == "User registered successfully"

    # Verify user exists in DB
    user = db_session.query(User).filter(User.username == "newuser@example.com").first()
    assert user is not None
    assert user.customer_id.startswith("CUST-")
    assert user.security_question == "What was the name of your first pet?"

    # Verify audit log
    audit = db_session.query(AuditLog).filter(AuditLog.user_id == user.id).first()
    assert audit is not None
    assert audit.event_type == "USER_REGISTRATION"


def test_register_existing_username(client, db_session):
    # test@example.com is seeded by default
    response = client.post(
        "/api/v1/auth/register",
        json={
            "account_number": "123456789",
            "password": "SecurePassword123!",
            "ssn": "999-99-9999",
            "username": "test@example.com",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already exists"


def test_register_invalid_password(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "account_number": "123456789",
            "password": "short",
            "ssn": "999-99-9999",
            "username": "newuser@example.com",
        },
    )
    assert response.status_code == 422  # Pydantic validation error


def test_register_invalid_core_banking(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "account_number": "invalid",
            "password": "SecurePassword123!",
            "ssn": "999-99-9999",
            "username": "newuser@example.com",
        },
    )
    assert response.status_code == 404
    assert (
        response.json()["detail"] == "Account number or SSN not found in core banking"
    )


def test_login_success_triggers_mfa(client, db_session):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["mfa_required"] is True
    assert "user_id" in data

    # Verify MFA code was generated
    mfa = db_session.query(MFACode).filter(MFACode.user_id == data["user_id"]).first()
    assert mfa is not None
    assert len(mfa.code) == 6


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_account_locking(client, db_session):
    # Perform 4 failed login attempts (should return 401)
    for _ in range(4):
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "test@example.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    # 5th attempt should lock the account and return 403
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Account locked due to too many failed attempts"

    # 6th attempt should also be locked (403)
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Account locked due to too many failed attempts"


def test_verify_mfa_success(client, db_session):
    # Trigger login to generate MFA code
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": "test@example.com", "password": "testpassword"},
    )
    user_id = login_resp.json()["user_id"]

    # Get the generated MFA code from DB
    mfa = db_session.query(MFACode).filter(MFACode.user_id == user_id).first()

    # Verify MFA
    verify_resp = client.post(
        "/api/v1/auth/verify-mfa", json={"user_id": user_id, "code": mfa.code}
    )
    assert verify_resp.status_code == 200
    data = verify_resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "test@example.com"


def test_verify_mfa_invalid_code(client, db_session):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": "test@example.com", "password": "testpassword"},
    )
    user_id = login_resp.json()["user_id"]

    verify_resp = client.post(
        "/api/v1/auth/verify-mfa", json={"user_id": user_id, "code": "000000"}
    )
    assert verify_resp.status_code == 400
    assert verify_resp.json()["detail"] == "Invalid or expired MFA code"


def test_session_and_logout(client, db_session):
    # Login and verify MFA to get token
    client.post(
        "/api/v1/auth/login",
        json={"username": "test@example.com", "password": "testpassword"},
    )
    user = db_session.query(User).filter(User.username == "test@example.com").first()
    mfa = db_session.query(MFACode).filter(MFACode.user_id == user.id).first()

    verify_resp = client.post(
        "/api/v1/auth/verify-mfa", json={"user_id": user.id, "code": mfa.code}
    )
    token = verify_resp.json()["access_token"]

    # Get session info
    headers = {"Authorization": f"Bearer {token}"}
    session_resp = client.get("/api/v1/auth/session", headers=headers)
    assert session_resp.status_code == 200
    assert session_resp.json()["username"] == "test@example.com"

    # Logout
    logout_resp = client.post("/api/v1/auth/logout", headers=headers)
    assert logout_resp.status_code == 200
    assert logout_resp.json()["message"] == "Successfully logged out"


def test_token_refresh(client, db_session):
    # Login and verify MFA to get refresh token
    client.post(
        "/api/v1/auth/login",
        json={"username": "test@example.com", "password": "testpassword"},
    )
    user = db_session.query(User).filter(User.username == "test@example.com").first()
    mfa = db_session.query(MFACode).filter(MFACode.user_id == user.id).first()

    verify_resp = client.post(
        "/api/v1/auth/verify-mfa", json={"user_id": user.id, "code": mfa.code}
    )
    refresh_token = verify_resp.json()["refresh_token"]

    # Refresh token
    refresh_resp = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert refresh_resp.status_code == 200
    assert "access_token" in refresh_resp.json()


def test_password_recovery(client, db_session):
    # Initiate recovery without security answer (should fail)
    init_resp = client.post(
        "/api/v1/auth/recover/initiate", json={"username": "test@example.com"}
    )
    assert init_resp.status_code == 400
    assert "Security answer required" in init_resp.json()["detail"]

    # Initiate recovery with wrong security answer (should fail)
    init_resp = client.post(
        "/api/v1/auth/recover/initiate",
        json={"username": "test@example.com", "security_answer": "wrong answer"},
    )
    assert init_resp.status_code == 400
    assert init_resp.json()["detail"] == "Invalid security answer"

    # Initiate recovery with correct security answer (should succeed)
    init_resp = client.post(
        "/api/v1/auth/recover/initiate",
        json={"username": "test@example.com", "security_answer": "first pet"},
    )
    assert init_resp.status_code == 200
    assert init_resp.json()["username"] == "test@example.com"

    # Get recovery code from DB
    user = db_session.query(User).filter(User.username == "test@example.com").first()
    mfa = (
        db_session.query(MFACode)
        .filter(MFACode.user_id == user.id)
        .order_by(MFACode.created_at.desc())
        .first()
    )

    # Complete recovery
    complete_resp = client.post(
        "/api/v1/auth/recover/complete",
        json={
            "username": "test@example.com",
            "email_code": mfa.code,
            "new_password": "NewSecurePassword123!",
        },
    )
    assert complete_resp.status_code == 200
    assert complete_resp.json()["message"] == "Password reset successfully"

    # Verify login with new password works
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"username": "test@example.com", "password": "NewSecurePassword123!"},
    )
    assert login_resp.status_code == 200
