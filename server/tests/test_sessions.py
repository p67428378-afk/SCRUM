import datetime
import uuid


from server.models.session import UserSession


def test_list_and_revoke_sessions(client):
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
    from server.utils.notifications import sent_notifications

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

    # List sessions
    sessions_response = client.get("/api/v1/sessions", headers=headers)
    assert sessions_response.status_code == 200
    sessions_list = sessions_response.json()
    assert len(sessions_list) >= 1
    assert any(s["is_current"] is True for s in sessions_list)

    # Revoke session
    session_id = sessions_list[0]["id"]
    revoke_response = client.post(
        f"/api/v1/sessions/{session_id}/revoke", headers=headers
    )
    assert revoke_response.status_code == 200
    assert "revoked" in revoke_response.json()["message"].lower()


def test_sessions_invalid_auth_header(client):
    response = client.get(
        "/api/v1/sessions", headers={"Authorization": "InvalidFormat"}
    )
    assert response.status_code == 401
    assert "invalid authorization header" in response.json()["detail"].lower()


def test_sessions_invalid_token(client):
    response = client.get(
        "/api/v1/sessions", headers={"Authorization": "Bearer invalidtoken"}
    )
    assert response.status_code == 401
    assert "invalid or expired access token" in response.json()["detail"].lower()


def test_sessions_inactive_session(client, db_session):
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

    from server.utils.notifications import sent_notifications

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

    # Inactivate the session in DB
    session = db_session.query(UserSession).first()
    session.is_active = False
    db_session.commit()

    response = client.get("/api/v1/sessions", headers=headers)
    assert response.status_code == 401
    assert "inactive or revoked" in response.json()["detail"].lower()


def test_sessions_inactivity_timeout(client, db_session):
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

    from server.utils.notifications import sent_notifications

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

    # Set last_active_at to 20 minutes ago
    session = db_session.query(UserSession).first()
    session.last_active_at = datetime.datetime.now(
        datetime.timezone.utc
    ) - datetime.timedelta(minutes=20)
    db_session.commit()

    response = client.get("/api/v1/sessions", headers=headers)
    assert response.status_code == 401
    assert "inactivity" in response.json()["detail"].lower()


def test_revoke_nonexistent_session(client):
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

    from server.utils.notifications import sent_notifications

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

    # Revoke nonexistent session
    response = client.post(f"/api/v1/sessions/{uuid.uuid4()}/revoke", headers=headers)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
