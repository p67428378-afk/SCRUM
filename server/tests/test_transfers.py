from fastapi import status


def get_auth_token(client):
    login_resp = client.post(
        "/api/v1/auth/login", json={"username": "testuser", "password": "testpassword"}
    )
    user_id = login_resp.json()["user"]["id"]
    client.post("/api/v1/auth/mfa/send-code", json={"user_id": user_id})
    verify_resp = client.post(
        "/api/v1/auth/mfa/verify-code", json={"user_id": user_id, "code": "123456"}
    )
    return verify_resp.json()["access_token"]


def test_create_transfer_success(client):
    # AC: Customers must be able to perform basic funds transfers between their own accounts within the bank.
    token = get_auth_token(client)
    # Get accounts to find checking and savings IDs
    acc_resp = client.get(
        "/api/v1/accounts", headers={"Authorization": f"Bearer {token}"}
    )
    accounts = acc_resp.json()
    checking_id = [
        acc["id"] for acc in accounts if acc["account_number_masked"] == "...4321"
    ][0]
    savings_id = [
        acc["id"] for acc in accounts if acc["account_number_masked"] == "...8765"
    ][0]

    # Initiate transfer
    transfer_resp = client.post(
        "/api/v1/transfers",
        json={
            "source_account_ref": checking_id,
            "destination_account_ref": savings_id,
            "amount": 100.00,
            "memo": "Test transfer",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert transfer_resp.status_code == status.HTTP_201_CREATED
    data = transfer_resp.json()
    assert float(data["amount"]) == 100.00
    assert data["status"] == "completed"
    assert "core_banking_tx_id" in data

    # Verify balances updated
    acc_resp_after = client.get(
        "/api/v1/accounts", headers={"Authorization": f"Bearer {token}"}
    )
    accounts_after = acc_resp_after.json()
    checking_balance_after = [
        float(acc["balance"]) for acc in accounts_after if acc["id"] == checking_id
    ][0]
    savings_balance_after = [
        float(acc["balance"]) for acc in accounts_after if acc["id"] == savings_id
    ][0]

    assert checking_balance_after == 12450.80 - 100.00
    assert savings_balance_after == 85120.45 + 100.00


def test_create_transfer_insufficient_funds(client):
    # AC: Customers must be able to perform basic funds transfers between their own accounts within the bank.
    token = get_auth_token(client)
    acc_resp = client.get(
        "/api/v1/accounts", headers={"Authorization": f"Bearer {token}"}
    )
    accounts = acc_resp.json()
    checking_id = [
        acc["id"] for acc in accounts if acc["account_number_masked"] == "...4321"
    ][0]
    savings_id = [
        acc["id"] for acc in accounts if acc["account_number_masked"] == "...8765"
    ][0]

    # Initiate transfer with excessive amount
    transfer_resp = client.post(
        "/api/v1/transfers",
        json={
            "source_account_ref": checking_id,
            "destination_account_ref": savings_id,
            "amount": 999999.00,
            "memo": "Excessive transfer",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert transfer_resp.status_code == status.HTTP_400_BAD_REQUEST
    assert transfer_resp.json()["detail"] == "Insufficient funds"
