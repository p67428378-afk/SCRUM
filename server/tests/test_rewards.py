def get_auth_headers(client):
    res = client.post(
        "/api/v1/users/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_rewards_balance_unauthenticated(client):
    response = client.get("/api/v1/rewards/balance")
    assert response.status_code == 401


def test_get_rewards_balance_initial(client):
    headers = get_auth_headers(client)
    res = client.get("/api/v1/rewards/balance", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "user_id" in data
    assert data["points_balance"] == 0


def test_rewards_awarded_on_checkout(client):
    headers = get_auth_headers(client)

    # Fetch products to find a variant
    prod_res = client.get("/api/v1/products")
    assert prod_res.status_code == 200
    products = prod_res.json()["items"]
    assert len(products) > 0

    # Get product detail to retrieve variant ID
    product_id = products[0]["id"]
    detail_res = client.get(f"/api/v1/products/{product_id}")
    assert detail_res.status_code == 200
    variants = detail_res.json()["variants"]
    assert len(variants) > 0
    variant_id = variants[0]["id"]

    # Add item to cart
    cart_add_res = client.post(
        "/api/v1/cart/items",
        json={"variant_id": variant_id, "quantity": 1},
        headers=headers,
    )
    assert cart_add_res.status_code == 200

    # Checkout
    checkout_res = client.post(
        "/api/v1/orders/checkout",
        json={
            "shipping_address": "123 Main St, Anytown, CA 90210",
            "payment_method": "Card",
        },
        headers=headers,
    )
    assert checkout_res.status_code == 201
    order_data = checkout_res.json()
    total_amount = order_data["total_amount"]
    expected_points = int(total_amount)

    # Check rewards balance
    rewards_res = client.get("/api/v1/rewards/balance", headers=headers)
    assert rewards_res.status_code == 200
    rewards_data = rewards_res.json()
    assert rewards_data["points_balance"] == expected_points
