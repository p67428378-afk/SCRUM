def test_estimate_checkout(client):
    response = client.post(
        "/api/v1/checkout/estimate",
        json={
            "subtotal": 500.0,
            "coupon_code": "FURNITURE20",
            "shipping_method": "standard",
            "shipping_address": {
                "full_name": "Alice Smith",
                "address_line1": "123 Elm St",
                "city": "Austin",
                "state": "TX",
                "postal_code": "78701",
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["subtotal"] == 500.0
    assert data["discount_amount"] == 100.0  # 20% of 500
    # Discounted subtotal = 400.0, Tax 8% = 32.0, Shipping = 50.0, Total = 482.0
    assert data["tax_amount"] == 32.0
    assert data["shipping_amount"] == 50.0
    assert data["total_amount"] == 482.0


def test_create_order_empty_cart_fails(client, auth_headers):
    response = client.post(
        "/api/v1/orders",
        json={
            "shipping_address": {
                "full_name": "Test User",
                "address_line1": "742 Evergreen Terrace",
                "city": "Springfield",
                "state": "OR",
                "postal_code": "97477",
            },
            "payment_method": "Credit Card",
        },
        headers=auth_headers,
    )
    assert response.status_code == 400
    assert "empty shopping cart" in response.json()["detail"]


def test_create_order_and_verify_tracking(client, auth_headers):
    # Get a product
    prod_res = client.get("/api/v1/products?search=Platform%20Bed")
    product = prod_res.json()["items"][0]
    initial_stock = product["stock_quantity"]

    # Add item to user cart
    add_res = client.post(
        "/api/v1/cart/items",
        json={
            "product_id": product["id"],
            "quantity": 1,
            "selected_finish": "Natural Walnut",
            "selected_dimension": "Queen",
        },
        headers=auth_headers,
    )
    assert add_res.status_code == 201

    # Place order
    order_res = client.post(
        "/api/v1/orders",
        json={
            "shipping_address": {
                "full_name": "Test User",
                "address_line1": "100 Maple St",
                "city": "Seattle",
                "state": "WA",
                "postal_code": "98101",
            },
            "payment_method": "Credit Card",
            "coupon_code": "SAVE10",
        },
        headers=auth_headers,
    )
    assert order_res.status_code == 201
    order = order_res.json()
    assert "tracking_id" in order
    assert order["tracking_id"].startswith("TRK-FURN-")
    assert order["status"] == "Processing"
    assert len(order["items"]) == 1
    assert order["items"][0]["product_id"] == product["id"]

    # Verify stock decremented
    updated_prod_res = client.get(f"/api/v1/products/{product['id']}")
    assert updated_prod_res.json()["stock_quantity"] == initial_stock - 1

    # Verify cart is empty
    cart_res = client.get("/api/v1/cart", headers=auth_headers)
    assert cart_res.json()["items"] == []

    # Verify order is listed in user orders
    list_orders_res = client.get("/api/v1/orders", headers=auth_headers)
    assert list_orders_res.status_code == 200
    user_orders = list_orders_res.json()
    assert any(o["id"] == order["id"] for o in user_orders)

    # Get single order detail
    get_order_res = client.get(f"/api/v1/orders/{order['id']}", headers=auth_headers)
    assert get_order_res.status_code == 200
    assert get_order_res.json()["id"] == order["id"]
