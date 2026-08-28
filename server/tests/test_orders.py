def test_checkout_and_get_orders(client, auth_headers):
    # Get product
    products_res = client.get("/api/v1/products")
    product_id = products_res.json()[0]["id"]

    # Checkout
    checkout_res = client.post(
        "/api/v1/orders/checkout",
        json={"items": [{"product_id": product_id, "quantity": 1}]},
        headers=auth_headers,
    )
    assert checkout_res.status_code == 201
    data = checkout_res.json()
    assert "id" in data
    assert data["points_awarded"] > 0

    # Get order history
    orders_res = client.get("/api/v1/orders", headers=auth_headers)
    assert orders_res.status_code == 200
    assert len(orders_res.json()) >= 1
