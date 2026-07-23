from datetime import date


def test_auth_flow(client):
    # Register a new user
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "name": "New User",
            "password": "newpassword",
        },
    )
    assert register_response.status_code == 200
    data = register_response.json()
    assert data["email"] == "newuser@example.com"
    assert data["name"] == "New User"
    assert "id" in data

    # Login with the new user
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "newuser@example.com", "password": "newpassword"},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"


def test_funding_accounts(client):
    # Login as seeded user
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get linked funding accounts
    accounts_response = client.get("/api/v1/payments/accounts", headers=headers)
    assert accounts_response.status_code == 200
    accounts = accounts_response.json()
    assert len(accounts) == 4
    assert accounts[0]["account_number_last4"] == "4321"

    # Link a new funding account
    new_account_response = client.post(
        "/api/v1/payments/accounts",
        headers=headers,
        json={
            "account_number": "1234567890",
            "account_provider": "Wells Fargo",
            "account_type": "CHECKING",
            "routing_number": "123456789",
        },
    )
    assert new_account_response.status_code == 200
    new_acc = new_account_response.json()
    assert new_acc["account_number_last4"] == "7890"
    assert new_acc["account_provider"] == "Wells Fargo"

    # Unlink the account
    unlink_response = client.delete(
        f"/api/v1/payments/accounts/{new_acc['id']}", headers=headers
    )
    assert unlink_response.status_code == 200
    assert unlink_response.json() == {"status": "success"}


def test_payees(client):
    # Login as seeded user
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get payees
    payees_response = client.get("/api/v1/payments/payees", headers=headers)
    assert payees_response.status_code == 200
    payees = payees_response.json()
    assert len(payees) == 3
    assert any(p["name"] == "Metropolitan Water" for p in payees)


def test_recurring_payments_flow(client):
    # Login as seeded user
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get payees and accounts to use their IDs
    payees = client.get("/api/v1/payments/payees", headers=headers).json()
    accounts = client.get("/api/v1/payments/accounts", headers=headers).json()

    payee_id = payees[0]["id"]
    acc1_id = accounts[0]["id"]
    acc2_id = accounts[1]["id"]

    # Create a recurring payment with valid percentage splits (50/50)
    create_response = client.post(
        "/api/v1/payments/recurring",
        headers=headers,
        json={
            "amount": 100.00,
            "currency": "USD",
            "description": "Water Bill",
            "frequency": "MONTHLY",
            "payee_id": payee_id,
            "start_date": str(date.today()),
            "splits": [
                {
                    "funding_account_id": acc1_id,
                    "split_type": "PERCENTAGE",
                    "split_value": 50.0,
                },
                {
                    "funding_account_id": acc2_id,
                    "split_type": "PERCENTAGE",
                    "split_value": 50.0,
                },
            ],
        },
    )
    assert create_response.status_code == 200
    payment = create_response.json()
    assert payment["amount"] == 100.00
    assert len(payment["splits"]) == 2

    # Create a recurring payment with invalid percentage splits (sum to 90%)
    invalid_percentage_response = client.post(
        "/api/v1/payments/recurring",
        headers=headers,
        json={
            "amount": 100.00,
            "currency": "USD",
            "description": "Water Bill",
            "frequency": "MONTHLY",
            "payee_id": payee_id,
            "start_date": str(date.today()),
            "splits": [
                {
                    "funding_account_id": acc1_id,
                    "split_type": "PERCENTAGE",
                    "split_value": 50.0,
                },
                {
                    "funding_account_id": acc2_id,
                    "split_type": "PERCENTAGE",
                    "split_value": 40.0,
                },
            ],
        },
    )
    assert invalid_percentage_response.status_code == 400
    assert (
        "Percentage splits must sum to exactly 100%"
        in invalid_percentage_response.json()["detail"]
    )

    # Create a recurring payment with valid fixed splits (60/40 for 100.00)
    create_fixed_response = client.post(
        "/api/v1/payments/recurring",
        headers=headers,
        json={
            "amount": 100.00,
            "currency": "USD",
            "description": "Energy Bill",
            "frequency": "MONTHLY",
            "payee_id": payee_id,
            "start_date": str(date.today()),
            "splits": [
                {
                    "funding_account_id": acc1_id,
                    "split_type": "FIXED",
                    "split_value": 60.0,
                },
                {
                    "funding_account_id": acc2_id,
                    "split_type": "FIXED",
                    "split_value": 40.0,
                },
            ],
        },
    )
    assert create_fixed_response.status_code == 200

    # Create a recurring payment with invalid fixed splits (sum to 90.00 for 100.00 amount)
    invalid_fixed_response = client.post(
        "/api/v1/payments/recurring",
        headers=headers,
        json={
            "amount": 100.00,
            "currency": "USD",
            "description": "Energy Bill",
            "frequency": "MONTHLY",
            "payee_id": payee_id,
            "start_date": str(date.today()),
            "splits": [
                {
                    "funding_account_id": acc1_id,
                    "split_type": "FIXED",
                    "split_value": 60.0,
                },
                {
                    "funding_account_id": acc2_id,
                    "split_type": "FIXED",
                    "split_value": 30.0,
                },
            ],
        },
    )
    assert invalid_fixed_response.status_code == 400
    assert (
        "Fixed splits must sum to exactly the payment amount"
        in invalid_fixed_response.json()["detail"]
    )

    # Get all recurring payments
    list_response = client.get("/api/v1/payments/recurring", headers=headers)
    assert list_response.status_code == 200
    payments_list = list_response.json()
    assert len(payments_list) == 2

    # Get specific recurring payment details
    get_response = client.get(
        f"/api/v1/payments/recurring/{payment['id']}", headers=headers
    )
    assert get_response.status_code == 200
    assert get_response.json()["description"] == "Water Bill"

    # Update recurring payment
    update_response = client.put(
        f"/api/v1/payments/recurring/{payment['id']}",
        headers=headers,
        json={
            "amount": 150.00,
            "currency": "USD",
            "description": "Updated Water Bill",
            "frequency": "MONTHLY",
            "start_date": str(date.today()),
            "splits": [
                {
                    "funding_account_id": acc1_id,
                    "split_type": "PERCENTAGE",
                    "split_value": 30.0,
                },
                {
                    "funding_account_id": acc2_id,
                    "split_type": "PERCENTAGE",
                    "split_value": 70.0,
                },
            ],
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["amount"] == 150.00

    # Cancel recurring payment
    cancel_response = client.delete(
        f"/api/v1/payments/recurring/{payment['id']}", headers=headers
    )
    assert cancel_response.status_code == 200
    assert cancel_response.json() == {"status": "success"}


def test_execute_payment_schedule(client):
    # Login as seeded user
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get payees and accounts to use their IDs
    payees = client.get("/api/v1/payments/payees", headers=headers).json()
    accounts = client.get("/api/v1/payments/accounts", headers=headers).json()

    payee_id = payees[0]["id"]
    acc1_id = accounts[0]["id"]
    acc2_id = accounts[1]["id"]

    # Create a recurring payment with valid percentage splits (50/50)
    create_response = client.post(
        "/api/v1/payments/recurring",
        headers=headers,
        json={
            "amount": 100.00,
            "currency": "USD",
            "description": "Water Bill",
            "frequency": "MONTHLY",
            "payee_id": payee_id,
            "start_date": str(date.today()),
            "splits": [
                {
                    "funding_account_id": acc1_id,
                    "split_type": "PERCENTAGE",
                    "split_value": 50.0,
                },
                {
                    "funding_account_id": acc2_id,
                    "split_type": "PERCENTAGE",
                    "split_value": 50.0,
                },
            ],
        },
    )
    assert create_response.status_code == 200
    payment = create_response.json()

    # Execute the payment schedule
    execute_response = client.post(
        f"/api/v1/payments/recurring/{payment['id']}/execute", headers=headers
    )
    assert execute_response.status_code == 200
    txn = execute_response.json()
    assert txn["status"] == "SUCCESS"
    assert txn["amount"] == 100.00
    assert "gateway_transaction_id" in txn
