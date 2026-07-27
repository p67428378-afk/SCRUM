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


def test_open_account_success(client):
    token = get_auth_token(client)
    response = client.post(
        "/api/v1/accounts",
        json={"account_type": "Savings", "initial_deposit": 1000.00},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["account_type"] == "Savings"
    assert float(data["balance"]) == 1000.00
    assert data["status"] == "active"


def test_get_statements_success(client):
    token = get_auth_token(client)
    acc_resp = client.get(
        "/api/v1/accounts", headers={"Authorization": f"Bearer {token}"}
    )
    checking_id = [
        acc["id"]
        for acc in acc_resp.json()
        if acc["account_number_masked"] == "...4321"
    ][0]

    response = client.get(
        f"/api/v1/accounts/{checking_id}/statements",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    statements = response.json()
    assert len(statements) == 3
    assert "id" in statements[0]
    assert "statement_period" in statements[0]


def test_get_statement_detail_success(client):
    token = get_auth_token(client)
    acc_resp = client.get(
        "/api/v1/accounts", headers={"Authorization": f"Bearer {token}"}
    )
    checking_id = [
        acc["id"]
        for acc in acc_resp.json()
        if acc["account_number_masked"] == "...4321"
    ][0]

    # Get statements list first
    stmt_resp = client.get(
        f"/api/v1/accounts/{checking_id}/statements",
        headers={"Authorization": f"Bearer {token}"},
    )
    stmt_id = stmt_resp.json()[0]["id"]

    response = client.get(
        f"/api/v1/accounts/{checking_id}/statements/{stmt_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == stmt_id
    assert "starting_balance" in data
    assert "ending_balance" in data


def test_export_transactions_success(client):
    token = get_auth_token(client)
    acc_resp = client.get(
        "/api/v1/accounts", headers={"Authorization": f"Bearer {token}"}
    )
    checking_id = [
        acc["id"]
        for acc in acc_resp.json()
        if acc["account_number_masked"] == "...4321"
    ][0]

    response = client.get(
        f"/api/v1/accounts/{checking_id}/transactions/export",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert (
        "Transaction ID,Date,Description,Category,Amount,Status,Reference ID"
        in response.text
    )
