import uuid

from server.routers.webhooks import clear_dispatched_webhooks, dispatched_webhooks
from server.services.core_banking import (
    simulate_underwriting_kyc,
    sync_account_with_core,
)
from server.tests.test_banking import get_auth_headers


def test_secure_messaging(client):
    headers = get_auth_headers(client)

    # 1. List messages (should be empty initially)
    response = client.get("/api/v1/messages", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 0

    # 2. Send a message
    payload = {
        "subject": "Inquiry about loan rates",
        "body": "Hello, I would like to know the current interest rates for a home loan.",
    }
    response = client.post("/api/v1/messages", json=payload, headers=headers)
    assert response.status_code == 200
    msg_id = response.json()["id"]
    assert response.json()["subject"] == "Inquiry about loan rates"
    assert response.json()["is_read"] is False

    # 3. Get message detail
    response = client.get(f"/api/v1/messages/{msg_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == msg_id

    # 4. Mark message as read
    response = client.put(f"/api/v1/messages/{msg_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["is_read"] is True

    # 5. List messages again
    response = client.get("/api/v1/messages", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["is_read"] is True


def test_configurable_alerts_and_notifications(client):
    headers = get_auth_headers(client)

    # 1. Set alert preferences with low thresholds to trigger alerts
    update_payload = {
        "push_enabled": True,
        "sms_enabled": True,
        "email_enabled": True,
        "low_balance_threshold": 15000.00,  # High threshold to trigger low balance alert
        "large_transaction_threshold": 50.00,  # Low threshold to trigger large transaction alert
    }
    response = client.put(
        "/api/v1/alerts/preferences", json=update_payload, headers=headers
    )
    assert response.status_code == 200

    # 2. Perform an internal transfer to trigger alerts
    accounts = client.get("/api/v1/accounts", headers=headers).json()
    checking = next(a for a in accounts if a["account_type"] == "checking")
    savings = next(a for a in accounts if a["account_type"] == "savings")

    transfer_payload = {
        "amount": 100.00,  # Exceeds large_transaction_threshold of 50.00
        "source_account_id": checking["id"],
        "destination_account_id": savings["id"],
        "memo": "Trigger alerts",
    }
    headers["Idempotency-Key"] = str(uuid.uuid4())
    response = client.post(
        "/api/v1/transfers/internal", json=transfer_payload, headers=headers
    )
    assert response.status_code == 200

    # 3. Check alert history
    response = client.get("/api/v1/alerts", headers=headers)
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0
    assert any(a["type"] == "large_transaction" for a in alerts)
    assert any(a["type"] == "low_balance" for a in alerts)


def test_core_banking_integration():
    # Test underwriting/KYC simulation
    app_data_approved = {"name": "John Doe", "email": "john@example.com"}
    res_approved = simulate_underwriting_kyc(app_data_approved)
    assert res_approved["status"] == "approved"

    app_data_rejected = {"name": "Reject Me", "email": "reject@example.com"}
    res_rejected = simulate_underwriting_kyc(app_data_rejected)
    assert res_rejected["status"] == "rejected"

    # Test account sync simulation
    res_sync = sync_account_with_core(uuid.uuid4())
    assert res_sync["status"] == "synced"


def test_webhooks_and_dispatch(client):
    headers = get_auth_headers(client)
    clear_dispatched_webhooks()

    # 1. Subscribe to webhooks
    sub_payload = {
        "url": "https://example.com/webhook-receiver",
        "event_type": "payee_added",
        "secret": "super-secret-key",
    }
    response = client.post("/api/v1/webhooks", json=sub_payload, headers=headers)
    assert response.status_code == 200
    sub_id = response.json()["id"]

    # 2. List subscriptions
    response = client.get("/api/v1/webhooks", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == sub_id

    # 3. Trigger payee_added event by adding a payee
    # Step-up first
    step_up_init = client.post(
        "/api/v1/auth/step-up",
        json={"action_type": "add_payee"},
        headers=headers,
    )
    step_up_session_id = step_up_init.json()["step_up_session_id"]
    client.post(
        "/api/v1/auth/step-up",
        json={
            "action_type": "add_payee",
            "code": "000000",
            "step_up_session_id": step_up_session_id,
        },
        headers=headers,
    )

    payee_payload = {
        "name": "Jane Smith",
        "account_number": "1122334455",
        "routing_number": "987654321",
        "step_up_session_id": step_up_session_id,
    }
    response = client.post("/api/v1/payees", json=payee_payload, headers=headers)
    assert response.status_code == 200

    # 4. Verify webhook was dispatched
    assert len(dispatched_webhooks) == 1
    assert dispatched_webhooks[0]["event_type"] == "payee_added"
    assert dispatched_webhooks[0]["payload"]["name"] == "Jane Smith"

    # 5. Unsubscribe
    response = client.delete(f"/api/v1/webhooks/{sub_id}", headers=headers)
    assert response.status_code == 204


def test_admin_config(client):
    # Login as admin
    headers = get_auth_headers(client, username="admin", password="adminpassword")

    # 1. List config items (should be empty or default)
    response = client.get("/api/v1/admin/config", headers=headers)
    assert response.status_code == 200

    # 2. Create/update config item
    config_payload = {
        "key": "MAX_DAILY_TRANSFER_LIMIT",
        "value": "15000.00",
        "description": "Maximum daily transfer limit for retail customers",
    }
    response = client.post("/api/v1/admin/config", json=config_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["key"] == "MAX_DAILY_TRANSFER_LIMIT"
    assert response.json()["value"] == "15000.00"

    # 3. Delete config item
    response = client.delete(
        "/api/v1/admin/config/MAX_DAILY_TRANSFER_LIMIT", headers=headers
    )
    assert response.status_code == 204
