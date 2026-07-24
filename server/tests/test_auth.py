from server.utils.notifications import sent_notifications


def test_login_success_triggers_mfa(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "testuser",
            "password": "testpassword",
            "channel": "web",
            "device_fingerprint": "test-device-123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "MFA verification required"
    assert "mfa_session_id" in data
    assert "email" in data["mfa_methods"]


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "testuser",
            "password": "wrongpassword",
            "channel": "web",
            "device_fingerprint": "test-device-123",
        },
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"


def test_login_lockout_after_5_attempts(client):
    # Reset notifications
    sent_notifications.clear()

    # 5 failed attempts
    for _ in range(5):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "testuser",
                "password": "wrongpassword",
                "channel": "web",
                "device_fingerprint": "test-device-123",
            },
        )
        # The 5th attempt will trigger lockout and return 403
        if _ == 4:
            assert response.status_code == 403
            assert "locked" in response.json()["detail"].lower()
        else:
            assert response.status_code == 401

    # Verify lockout notification was sent
    assert any(
        n["type"] == "email" and "locked" in n["subject"].lower()
        for n in sent_notifications
    )


def test_mfa_verify_success(client):
    # First login to get mfa_session_id
    # Note: We need to use admin user since testuser is locked from the previous test
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "adminpassword",
            "channel": "web",
            "device_fingerprint": "test-device-123",
        },
    )
    assert response.status_code == 200
    mfa_session_id = response.json()["mfa_session_id"]

    # Find the sent OTP code from notifications
    otp_code = None
    for n in reversed(sent_notifications):
        if n["type"] == "email" and "verification code" in n["subject"].lower():
            # Extract 6-digit code
            import re

            match = re.search(r"\b\d{6}\b", n["body"])
            if match:
                otp_code = match.group(0)
                break

    assert otp_code is not None

    # Verify MFA
    verify_response = client.post(
        "/api/v1/auth/mfa/verify",
        json={"mfa_session_id": mfa_session_id, "method": "email", "code": otp_code},
    )
    assert verify_response.status_code == 200
    data = verify_response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["username"] == "admin"


def test_mfa_resend_cooldown_and_cap(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "adminpassword",
            "channel": "web",
            "device_fingerprint": "test-device-123",
        },
    )
    mfa_session_id = response.json()["mfa_session_id"]

    # First resend should succeed
    resend_response = client.post(
        "/api/v1/auth/mfa/resend",
        json={"mfa_session_id": mfa_session_id, "method": "email"},
    )
    assert resend_response.status_code == 200

    # Second resend immediately should fail due to cooldown
    resend_response2 = client.post(
        "/api/v1/auth/mfa/resend",
        json={"mfa_session_id": mfa_session_id, "method": "email"},
    )
    assert resend_response2.status_code == 400
    assert "wait" in resend_response2.json()["detail"].lower()


def test_step_up_authentication(client):
    # Login to get access token
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "admin",
            "password": "adminpassword",
            "channel": "web",
            "device_fingerprint": "test-device-123",
        },
    )
    mfa_session_id = response.json()["mfa_session_id"]

    # Find OTP
    otp_code = None
    for n in reversed(sent_notifications):
        if n["type"] == "email" and "verification code" in n["subject"].lower():
            import re

            match = re.search(r"\b\d{6}\b", n["body"])
            if match:
                otp_code = match.group(0)
                break

    verify_response = client.post(
        "/api/v1/auth/mfa/verify",
        json={"mfa_session_id": mfa_session_id, "method": "email", "code": otp_code},
    )
    access_token = verify_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    # Trigger step-up challenge
    step_up_response = client.post(
        "/api/v1/auth/step-up", json={"action_type": "change_contact"}, headers=headers
    )
    assert step_up_response.status_code == 200
    assert step_up_response.json()["step_up_required"] is True
    assert "step_up_session_id" in step_up_response.json()

    # Find step-up OTP
    step_up_otp = None
    for n in reversed(sent_notifications):
        if n["type"] == "email" and "step-up verification code" in n["subject"].lower():
            import re

            match = re.search(r"\b\d{6}\b", n["body"])
            if match:
                step_up_otp = match.group(0)
                break

    assert step_up_otp is not None

    # Verify step-up
    verify_step_up = client.post(
        "/api/v1/auth/step-up",
        json={"action_type": "change_contact", "code": step_up_otp},
        headers=headers,
    )
    assert verify_step_up.status_code == 200
    assert verify_step_up.json()["step_up_required"] is False
