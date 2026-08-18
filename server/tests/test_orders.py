def test_checkout_flow(client):
    # Login user
    login_res = client.post("/api/v1/users/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt checkout on empty cart
    empty_checkout = client.post("/api/v1/orders/checkout", json={
        "shipping_address": "123 Test Street",
        "payment_method": "Card"
    }, headers=headers)
    assert empty_checkout.status_code == 400

    # Get a product variant
    products_res = client.get("/api/v1/products")
    product_id = products_res.json()["items"][0]["id"]
    detail_res = client.get(f"/api/v1/products/{product_id}")
    variant_id = detail_res.json()["variants"][0]["id"]

    # Add item to user cart
    client.post("/api/v1/cart/items", json={
        "variant_id": variant_id,
        "quantity": 1
    }, headers=headers)

    # Perform checkout
    checkout_res = client.post("/api/v1/orders/checkout", json={
        "shipping_address": "123 Main St, City, ST 12345",
        "payment_method": "Credit Card"
    }, headers=headers)

    assert checkout_res.status_code == 201
    order_data = checkout_res.json()
    assert order_data["status"] == "Pending"
    assert order_data["total_amount"] > 0
    order_id = order_data["id"]

    # List orders
    orders_res = client.get("/api/v1/orders", headers=headers)
    assert orders_res.status_code == 200
    assert orders_res.json()["total"] >= 1

    # Get order detail
    get_order_res = client.get(f"/api/v1/orders/{order_id}", headers=headers)
    assert get_order_res.status_code == 200
    assert get_order_res.json()["id"] == order_id
