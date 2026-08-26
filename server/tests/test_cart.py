def test_get_empty_cart(client):
    headers = {"X-Session-ID": "test-cart-session-1"}
    response = client.get("/api/v1/cart", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["subtotal"] == 0.0
    assert data["total_amount"] == 0.0


def test_add_item_to_cart_and_calculations(client):
    headers = {"X-Session-ID": "test-cart-session-2"}
    # Get a product
    prod_res = client.get("/api/v1/products?search=Coffee%20Table")
    product = prod_res.json()["items"][0]

    # Add item
    add_res = client.post(
        "/api/v1/cart/items",
        json={
            "product_id": product["id"],
            "quantity": 2,
            "selected_finish": "Natural Oak",
            "selected_dimension": 'Standard (42" L)',
        },
        headers=headers,
    )
    assert add_res.status_code == 201
    cart = add_res.json()
    assert len(cart["items"]) == 1
    assert cart["items"][0]["quantity"] == 2
    assert cart["items"][0]["selected_finish"] == "Natural Oak"
    expected_subtotal = round(product["price"] * 2, 2)
    assert cart["subtotal"] == expected_subtotal
    assert cart["tax_amount"] == round(expected_subtotal * 0.08, 2)
    assert cart["shipping_amount"] == (0.0 if expected_subtotal >= 1000.0 else 50.0)


def test_update_cart_item_quantity(client):
    headers = {"X-Session-ID": "test-cart-session-3"}
    prod_res = client.get("/api/v1/products")
    product = prod_res.json()["items"][0]

    # Add 1 item
    add_res = client.post(
        "/api/v1/cart/items",
        json={"product_id": product["id"], "quantity": 1},
        headers=headers,
    )
    item_id = add_res.json()["items"][0]["id"]

    # Update to 3
    up_res = client.put(
        f"/api/v1/cart/items/{item_id}",
        json={"quantity": 3},
        headers=headers,
    )
    assert up_res.status_code == 200
    cart = up_res.json()
    assert cart["items"][0]["quantity"] == 3


def test_remove_cart_item(client):
    headers = {"X-Session-ID": "test-cart-session-4"}
    prod_res = client.get("/api/v1/products")
    product = prod_res.json()["items"][0]

    add_res = client.post(
        "/api/v1/cart/items",
        json={"product_id": product["id"], "quantity": 1},
        headers=headers,
    )
    item_id = add_res.json()["items"][0]["id"]

    del_res = client.delete(f"/api/v1/cart/items/{item_id}", headers=headers)
    assert del_res.status_code == 200
    assert len(del_res.json()["items"]) == 0


def test_apply_valid_and_invalid_coupon(client):
    headers = {"X-Session-ID": "test-cart-session-5"}
    prod_res = client.get("/api/v1/products")
    product = prod_res.json()["items"][0]

    client.post(
        "/api/v1/cart/items",
        json={"product_id": product["id"], "quantity": 1},
        headers=headers,
    )

    # Valid coupon
    valid_res = client.post(
        "/api/v1/cart/coupon", json={"coupon_code": "SAVE10"}, headers=headers
    )
    assert valid_res.status_code == 200
    data = valid_res.json()
    assert data["valid"] is True
    assert data["discount_percent"] == 10.0

    # Cart reflects discount
    cart_res = client.get("/api/v1/cart", headers=headers)
    cart = cart_res.json()
    assert cart["coupon_code"] == "SAVE10"
    assert cart["discount_amount"] > 0

    # Invalid coupon
    invalid_res = client.post(
        "/api/v1/cart/coupon", json={"coupon_code": "FAKEDISCOUNT99"}, headers=headers
    )
    assert invalid_res.status_code == 400


def test_clear_cart(client):
    headers = {"X-Session-ID": "test-cart-session-6"}
    prod_res = client.get("/api/v1/products")
    product = prod_res.json()["items"][0]

    client.post(
        "/api/v1/cart/items",
        json={"product_id": product["id"], "quantity": 2},
        headers=headers,
    )
    clear_res = client.delete("/api/v1/cart/clear", headers=headers)
    assert clear_res.status_code == 200
    assert len(clear_res.json()["items"]) == 0
    assert clear_res.json()["subtotal"] == 0.0
