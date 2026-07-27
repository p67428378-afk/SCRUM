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


def test_get_accounts_success(client):
    # AC: Customers must have a complete view of their deposit accounts, including near real-time balances and transaction histories.
    token = get_auth_token(client)
    response = client.get(
        "/api/v1/accounts", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    accounts = response.json()
    assert len(accounts) == 3
    assert any(acc["account_number_masked"] == "...4321" for acc in accounts)
    assert any(acc["account_number_masked"] == "...8765" for acc in accounts)


def test_get_transactions_success(client):
    # AC: Customers must have a complete view of their deposit accounts, including near real-time balances and transaction histories.
    token = get_auth_token(client)
    # Get accounts first to find checking account ID
    acc_resp = client.get(
        "/api/v1/accounts", headers={"Authorization": f"Bearer {token}"}
    )
    checking_id = [
        acc["id"]
        for acc in acc_resp.json()
        if acc["account_number_masked"] == "...4321"
    ][0]

    # Get transactions
    tx_resp = client.get(
        f"/api/v1/accounts/{checking_id}/transactions",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert tx_resp.status_code == status.HTTP_200_OK
    data = tx_resp.json()
    assert data["total"] == 5
    assert len(data["transactions"]) == 5
    assert data["transactions"][0]["description"] == "Starbucks"


def test_get_transactions_filtered(client):
    # AC: Customers must have a complete view of their deposit accounts, including near real-time balances and transaction histories.
    token = get_auth_token(client)
    acc_resp = client.get(
        "/api/v1/accounts", headers={"Authorization": f"Bearer {token}"}
    )
    checking_id = [
        acc["id"]
        for acc in acc_resp.json()
        if acc["account_number_masked"] == "...4321"
    ][0]

    # Filter by category
    tx_resp = client.get(
        f"/api/v1/accounts/{checking_id}/transactions?category=Income",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert tx_resp.status_code == status.HTTP_200_OK
    data = tx_resp.json()
    assert data["total"] == 1
    assert data["transactions"][0]["description"] == "Salary Deposit"

    # Filter by search
    tx_resp = client.get(
        f"/api/v1/accounts/{checking_id}/transactions?search=Whole",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert tx_resp.status_code == status.HTTP_200_OK
    data = tx_resp.json()
    assert data["total"] == 1
    assert data["transactions"][0]["description"] == "Whole Foods"
