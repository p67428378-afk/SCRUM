def test_cart_operations(client):
    session_id = "test-session-123"
    headers = {"X-Session-ID": session_id}

    # Get empty cart
    res = client.get("/api/v1/cart", headers=headers)
    assert res.status_code == 200
    assert res.json()["subtotal"] == 0.0

    # Get product variant
    prod_res = client.get("/api/v1/products")
    product_id = prod_res.json()["items"][0]["id"]
    detail_res = client.get(f"/api/v1/products/{product_id}")
    variant = detail_res.json()["variants"][0]
    variant_id = variant["id"]

    # Add item to cart
    add_res = client.post("/api/v1/cart/items", json={
        "variant_id": variant_id,
        "quantity": 2
    }, headers=headers)
    assert add_res.status_code == 200
    cart = add_res.json()
    assert len(cart["items"]) == 1
    assert cart["items"][0]["quantity"] == 2
    item_id = cart["items"][0]["id"]

    # Update quantity
    update_res = client.put(f"/api/v1/cart/items/{item_id}", json={
        "quantity": 1
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["items"][0]["quantity"] == 1

    # Remove item
    del_res = client.delete(f"/api/v1/cart/items/{item_id}", headers=headers)
    assert del_res.status_code == 204

    # Verify empty cart
    final_res = client.get("/api/v1/cart", headers=headers)
    assert len(final_res.json()["items"]) == 0
