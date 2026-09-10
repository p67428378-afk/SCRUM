def test_list_customers(client):
    response = client.get("/api/v1/customers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3  # Seeded test accounts


def test_get_customer_and_history(client):
    response = client.get("/api/v1/customers")
    customers = response.json()
    test_cust = next(c for c in customers if c["email"] == "test@example.com")
    cust_id = test_cust["id"]

    # Get customer details
    get_res = client.get(f"/api/v1/customers/{cust_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["loyalty_points"] >= 100

    # Get history
    hist_res = client.get(f"/api/v1/customers/{cust_id}/history")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert "customer" in history
    assert "total_visits" in history
    assert "appointments" in history
    assert "loyalty_transactions" in history


def test_redeem_loyalty_points(client):
    # Create a fresh customer to isolate redemption test
    new_cust_res = client.post(
        "/api/v1/customers",
        json={
            "full_name": "Redeem Test Customer",
            "email": "redeem.test@example.com",
            "phone": "+15550999",
            "notes": "Redemption test",
        },
    )
    assert new_cust_res.status_code == 201
    cust_id = new_cust_res.json()["id"]

    # Earn points via complete appointment or direct loyalty accrual in test
    # Let's verify initial points is 0
    assert new_cust_res.json()["loyalty_points"] == 0

    # Test redeeming with insufficient points
    redeem_fail = client.post(
        f"/api/v1/customers/{cust_id}/loyalty/redeem",
        json={"points": 50, "description": "Over balance"},
    )
    assert redeem_fail.status_code == 400

    # Test redeeming on test@example.com who has balance
    test_cust = next(
        c
        for c in client.get("/api/v1/customers").json()
        if c["email"] == "test@example.com"
    )
    t_id = test_cust["id"]
    t_points = test_cust["loyalty_points"]

    if t_points >= 50:
        ok_res = client.post(
            f"/api/v1/customers/{t_id}/loyalty/redeem",
            json={"points": 50, "description": "$10 voucher"},
        )
        assert ok_res.status_code == 200
        tx = ok_res.json()
        assert tx["points_change"] == -50
        assert tx["transaction_type"] == "redemption"
