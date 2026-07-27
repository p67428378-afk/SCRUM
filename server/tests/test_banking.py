import uuid


def get_auth_headers(client, username="testuser", password="testpassword"):
    # Login to get access token
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": username,
            "password": password,
            "channel": "web",
            "device_fingerprint": "test-device-123",
        },
    )
    mfa_session_id = response.json()["mfa_session_id"]

    # Find OTP
    import re

    from server.utils.notifications import sent_notifications

    otp_code = None
    for n in reversed(sent_notifications):
        if n["type"] == "email" and "verification code" in n["subject"].lower():
            match = re.search(r"\b\d{6}\b", n["body"])
            if match:
                otp_code = match.group(0)
                break

    # Fallback to bypass code if no notification found
    if not otp_code:
        otp_code = "000000"

    verify_response = client.post(
        "/api/v1/auth/mfa/verify",
        json={"mfa_session_id": mfa_session_id, "method": "email", "code": otp_code},
    )
    access_token = verify_response.json()["access_token"]
    return {"Authorization": f"Bearer {access_token}"}


def test_list_accounts(client):
    headers = get_auth_headers(client)
    response = client.get("/api/v1/accounts", headers=headers)
    assert response.status_code == 200
    accounts = response.json()
    assert len(accounts) == 3
    assert any(a["account_type"] == "checking" for a in accounts)
    assert any(a["account_type"] == "savings" for a in accounts)


def test_get_single_account(client):
    headers = get_auth_headers(client)
    accounts = client.get("/api/v1/accounts", headers=headers).json()
    account_id = accounts[0]["id"]

    response = client.get(f"/api/v1/accounts/{account_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == account_id


def test_get_single_account_not_found(client):
    headers = get_auth_headers(client)
    response = client.get(f"/api/v1/accounts/{uuid.uuid4()}", headers=headers)
    assert response.status_code == 404


def test_internal_transfer(client):
    headers = get_auth_headers(client)
    accounts = client.get("/api/v1/accounts", headers=headers).json()
    checking = next(a for a in accounts if a["account_type"] == "checking")
    savings = next(a for a in accounts if a["account_type"] == "savings")

    # Perform transfer
    transfer_payload = {
        "amount": 100.00,
        "source_account_id": checking["id"],
        "destination_account_id": savings["id"],
        "memo": "Test transfer",
    }
    headers["Idempotency-Key"] = str(uuid.uuid4())
    response = client.post(
        "/api/v1/transfers/internal", json=transfer_payload, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert response.json()["amount"] == 100.00

    # Verify balances updated
    updated_accounts = client.get("/api/v1/accounts", headers=headers).json()
    updated_checking = next(
        a for a in updated_accounts if a["account_type"] == "checking"
    )
    updated_savings = next(
        a for a in updated_accounts if a["account_type"] == "savings"
    )

    assert updated_checking["balance"] == checking["balance"] - 100.00
    assert updated_savings["balance"] == savings["balance"] + 100.00


def test_internal_transfer_insufficient_funds(client):
    headers = get_auth_headers(client)
    accounts = client.get("/api/v1/accounts", headers=headers).json()
    checking = next(a for a in accounts if a["account_type"] == "checking")
    savings = next(a for a in accounts if a["account_type"] == "savings")

    transfer_payload = {
        "amount": checking["balance"] + 1000.00,
        "source_account_id": checking["id"],
        "destination_account_id": savings["id"],
    }
    response = client.post(
        "/api/v1/transfers/internal", json=transfer_payload, headers=headers
    )
    assert response.status_code == 400
    assert "insufficient funds" in response.json()["detail"].lower()


def test_payee_management_and_external_transfer(client):
    headers = get_auth_headers(client)

    # Step-up first to add payee
    step_up_init = client.post(
        "/api/v1/auth/step-up",
        json={"action_type": "add_payee"},
        headers=headers,
    )
    assert step_up_init.status_code == 200
    assert step_up_init.json()["step_up_required"] is True
    step_up_session_id = step_up_init.json()["step_up_session_id"]

    # Verify step-up with bypass code
    step_up_verify = client.post(
        "/api/v1/auth/step-up",
        json={
            "action_type": "add_payee",
            "code": "000000",
            "step_up_session_id": step_up_session_id,
        },
        headers=headers,
    )
    assert step_up_verify.status_code == 200
    assert step_up_verify.json()["step_up_required"] is False

    # Add payee
    payee_payload = {
        "name": "John Doe",
        "account_number": "987654321",
        "routing_number": "123456789",
        "step_up_session_id": step_up_session_id,
    }
    payee_response = client.post("/api/v1/payees", json=payee_payload, headers=headers)
    assert payee_response.status_code == 200
    payee_id = payee_response.json()["id"]
    assert payee_response.json()["status"] == "pending_verification"

    # Verify payee
    verify_response = client.post(
        f"/api/v1/payees/{payee_id}/verify",
        json={"verification_code": "000000"},
        headers=headers,
    )
    assert verify_response.status_code == 200
    assert verify_response.json()["status"] == "verified"

    # List payees
    payees_list = client.get("/api/v1/payees", headers=headers).json()
    assert any(p["id"] == payee_id for p in payees_list)

    # External transfer (under step-up threshold)
    accounts = client.get("/api/v1/accounts", headers=headers).json()
    checking = next(a for a in accounts if a["account_type"] == "checking")

    ext_payload = {
        "amount": 100.00,
        "source_account_id": checking["id"],
        "destination_payee_id": payee_id,
    }
    headers["Idempotency-Key"] = str(uuid.uuid4())
    ext_response = client.post(
        "/api/v1/transfers/external", json=ext_payload, headers=headers
    )
    assert ext_response.status_code == 200
    assert ext_response.json()["status"] == "completed"


def test_limits_endpoint(client):
    headers = get_auth_headers(client)
    response = client.get("/api/v1/limits", headers=headers)
    assert response.status_code == 200
    assert "daily_limit" in response.json()
    assert "daily_remaining" in response.json()


def test_alert_preferences(client):
    headers = get_auth_headers(client)
    response = client.get("/api/v1/alerts/preferences", headers=headers)
    assert response.status_code == 200
    assert response.json()["push_enabled"] is True

    # Update preferences
    update_payload = {
        "push_enabled": False,
        "sms_enabled": True,
        "email_enabled": False,
        "low_balance_threshold": 50.00,
        "large_transaction_threshold": 500.00,
    }
    update_response = client.put(
        "/api/v1/alerts/preferences", json=update_payload, headers=headers
    )
    assert update_response.status_code == 200

    # Verify updated
    get_updated = client.get("/api/v1/alerts/preferences", headers=headers).json()
    assert get_updated["push_enabled"] is False
    assert get_updated["low_balance_threshold"] == 50.00


def test_multiple_users_unique_accounts(client):
    # Get accounts for regular user
    headers_user = get_auth_headers(
        client, username="testuser", password="testpassword"
    )
    response_user = client.get("/api/v1/accounts", headers=headers_user)
    assert response_user.status_code == 200
    accounts_user = response_user.json()
    assert len(accounts_user) == 3
    user_acc_nums = {a["account_number"] for a in accounts_user}
    assert len(user_acc_nums) == 3
    for num in user_acc_nums:
        assert len(num) == 10
        assert num.isdigit()

    # Get accounts for admin user
    headers_admin = get_auth_headers(client, username="admin", password="adminpassword")
    response_admin = client.get("/api/v1/accounts", headers=headers_admin)
    assert response_admin.status_code == 200
    accounts_admin = response_admin.json()
    assert len(accounts_admin) == 3
    admin_acc_nums = {a["account_number"] for a in accounts_admin}
    assert len(admin_acc_nums) == 3
    for num in admin_acc_nums:
        assert len(num) == 10
        assert num.isdigit()

    # Ensure no overlap between user and admin account numbers
    assert user_acc_nums.isdisjoint(admin_acc_nums)
