import datetime
import re
import uuid
from unittest.mock import patch


from server.models.lockout import LockoutState
from server.models.user import User
from server.utils.notifications import sent_notifications
from server.utils.security import (
    create_access_token,
    create_mfa_session_token,
    create_refresh_token,
    decode_token,
    verify_password,
    verify_totp,
)


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


def test_login_user_not_found(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "nonexistentuser",
            "password": "somepassword",
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


def test_login_flow_restarts_lockout(client, db_session):
    # Reset lockout state for testuser
    user = db_session.query(User).filter(User.username == "testuser").first()
    user.is_locked = False
    user.locked_until = None
    lockout = (
        db_session.query(LockoutState).filter(LockoutState.user_id == user.id).first()
    )
    if lockout:
        lockout.failed_attempts = 0
        lockout.login_flow_restarts = 0
        lockout.last_restart_at = None
    db_session.commit()

    # Login successfully 4 times in a row (restarting the flow)
    for i in range(4):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "testuser",
                "password": "testpassword",
                "channel": "web",
                "device_fingerprint": "test-device-123",
            },
        )
        if i == 3:
            # The 4th restart exceeds MAX_FLOW_RESTARTS (3)
            assert response.status_code == 403
            assert "locked" in response.json()["detail"].lower()
        else:
            assert response.status_code == 200


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


def test_mfa_verify_invalid_session(client):
    response = client.post(
        "/api/v1/auth/mfa/verify",
        json={"mfa_session_id": str(uuid.uuid4()), "method": "email", "code": "123456"},
    )
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


def test_mfa_verify_invalid_code(client):
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

    response = client.post(
        "/api/v1/auth/mfa/verify",
        json={"mfa_session_id": mfa_session_id, "method": "email", "code": "000000"},
    )
    assert response.status_code == 400
    assert "invalid" in response.json()["detail"].lower()


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


def test_mfa_resend_invalid_session(client):
    response = client.post(
        "/api/v1/auth/mfa/resend",
        json={"mfa_session_id": str(uuid.uuid4()), "method": "email"},
    )
    assert response.status_code == 401


def test_refresh_token_success_and_failure(client):
    # Login to get refresh token
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
            match = re.search(r"\b\d{6}\b", n["body"])
            if match:
                otp_code = match.group(0)
                break

    verify_response = client.post(
        "/api/v1/auth/mfa/verify",
        json={"mfa_session_id": mfa_session_id, "method": "email", "code": otp_code},
    )
    refresh_token = verify_response.json()["refresh_token"]

    # Refresh token success
    refresh_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_response.status_code == 200
    assert "access_token" in refresh_response.json()

    # Refresh token failure (invalid token)
    refresh_response_fail = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "invalid_refresh_token"},
    )
    assert refresh_response_fail.status_code == 401


def test_logout_success(client):
    # Login to get refresh token
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
            match = re.search(r"\b\d{6}\b", n["body"])
            if match:
                otp_code = match.group(0)
                break

    verify_response = client.post(
        "/api/v1/auth/mfa/verify",
        json={"mfa_session_id": mfa_session_id, "method": "email", "code": otp_code},
    )
    refresh_token = verify_response.json()["refresh_token"]

    # Logout
    logout_response = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh_token},
    )
    assert logout_response.status_code == 200
    assert "logged out" in logout_response.json()["message"].lower()


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


def test_step_up_unauthorized(client):
    response = client.post(
        "/api/v1/auth/step-up", json={"action_type": "change_contact"}
    )
    assert response.status_code == 401


def test_step_up_large_transfer_no_step_up(client):
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

    # Trigger step-up challenge with amount < threshold (5000)
    step_up_response = client.post(
        "/api/v1/auth/step-up",
        json={"action_type": "large_transfer", "amount": 1000.0},
        headers=headers,
    )
    assert step_up_response.status_code == 200
    assert step_up_response.json()["step_up_required"] is False


def test_step_up_large_transfer_required(client):
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

    # Trigger step-up challenge with amount >= threshold (5000)
    step_up_response = client.post(
        "/api/v1/auth/step-up",
        json={"action_type": "large_transfer", "amount": 6000.0},
        headers=headers,
    )
    assert step_up_response.status_code == 200
    assert step_up_response.json()["step_up_required"] is True


def test_ip_rate_limiting(client):
    # Trigger IP rate limiting by making 21 login attempts
    # We can mock settings.IP_THROTTLE_THRESHOLD to a lower value or just make 21 requests
    with patch("server.routers.auth.settings.IP_THROTTLE_THRESHOLD", 3):
        for i in range(4):
            response = client.post(
                "/api/v1/auth/login",
                json={
                    "username": "admin",
                    "password": "adminpassword",
                    "channel": "web",
                    "device_fingerprint": "test-device-123",
                },
            )
            if i >= 3:
                assert response.status_code == 429
                assert "too many login attempts" in response.json()["detail"].lower()
            else:
                assert response.status_code == 200


def test_global_failed_attempts_throttling(client):
    with patch("server.routers.auth.settings.IP_THROTTLE_THRESHOLD", 100):
        # Mock global failed attempts list to have 100 items
        from server.routers.auth import global_failed_attempts

        global_failed_attempts.clear()
        for _ in range(100):
            global_failed_attempts.append(datetime.datetime.now(datetime.timezone.utc))

        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "admin",
                "password": "adminpassword",
                "channel": "web",
                "device_fingerprint": "test-device-123",
            },
        )
        assert response.status_code == 429
        assert "system is experiencing high load" in response.json()["detail"].lower()
        global_failed_attempts.clear()


def test_verify_password_exception():
    with patch(
        "server.utils.security.pwd_context.verify",
        side_effect=Exception("mocked exception"),
    ):
        assert verify_password("plain", "hash") is False


def test_create_access_token_custom_expiry():
    token = create_access_token(
        {"sub": "test"}, expires_delta=datetime.timedelta(minutes=5)
    )
    payload = decode_token(token)
    assert payload["sub"] == "test"


def test_create_refresh_token():
    token = create_refresh_token({"sub": "test"})
    payload = decode_token(token)
    assert payload["sub"] == "test"
    assert payload["type"] == "refresh"

    token_custom = create_refresh_token(
        {"sub": "test"}, expires_delta=datetime.timedelta(days=1)
    )
    payload_custom = decode_token(token_custom)
    assert payload_custom["sub"] == "test"


def test_create_mfa_session_token():
    token = create_mfa_session_token({"sub": "test"})
    payload = decode_token(token)
    assert payload["sub"] == "test"
    assert payload["type"] == "mfa_session"

    token_custom = create_mfa_session_token(
        {"sub": "test"}, expires_delta=datetime.timedelta(minutes=1)
    )
    payload_custom = decode_token(token_custom)
    assert payload_custom["sub"] == "test"


def test_decode_token_exception():
    assert decode_token("invalid_token_string") is None


def test_verify_totp_exception():
    assert verify_totp(None, "123456") is False
