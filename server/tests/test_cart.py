def test_get_cart_empty_or_initial(client, user_headers):
    # Clear cart first
    client.delete("/api/v1/cart", headers=user_headers)

    response = client.get("/api/v1/cart", headers=user_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["items"] == []
    assert data["subtotal"] == 0.0
    assert data["item_count"] == 0


def test_add_item_to_cart_and_calculate_subtotal(client, user_headers):
    # Clear cart
    client.delete("/api/v1/cart", headers=user_headers)

    # Get a book
    books_resp = client.get("/api/v1/books?limit=1")
    book = books_resp.json()["items"][0]
    book_id = book["id"]
    book_price = book["price"]

    # Add 2 items of this book
    response = client.post(
        "/api/v1/cart/items",
        json={"book_id": book_id, "quantity": 2},
        headers=user_headers,
    )

    assert response.status_code == 200
    cart_data = response.json()
    assert cart_data["item_count"] == 2
    expected_subtotal = round(book_price * 2, 2)
    assert cart_data["subtotal"] == expected_subtotal
    assert len(cart_data["items"]) == 1
    assert cart_data["items"][0]["book_id"] == book_id
    assert cart_data["items"][0]["quantity"] == 2


def test_update_cart_item_quantity(client, user_headers):
    books_resp = client.get("/api/v1/books?limit=1")
    book = books_resp.json()["items"][0]
    book_id = book["id"]

    # Update item quantity to 3
    response = client.put(
        f"/api/v1/cart/items/{book_id}", json={"quantity": 3}, headers=user_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["item_count"] == 3
    assert data["items"][0]["quantity"] == 3


def test_add_item_exceeding_stock_fails(client, user_headers):
    books_resp = client.get("/api/v1/books?limit=1")
    book = books_resp.json()["items"][0]
    book_id = book["id"]
    stock = book["stock_quantity"]

    # Try to add quantity exceeding stock
    response = client.post(
        "/api/v1/cart/items",
        json={"book_id": book_id, "quantity": stock + 100},
        headers=user_headers,
    )

    assert response.status_code == 400
    assert (
        "Stock limit" in response.json()["detail"]
        or "exceeds available stock" in response.json()["detail"]
    )


def test_remove_item_from_cart(client, user_headers):
    cart_resp = client.get("/api/v1/cart", headers=user_headers)
    items = cart_resp.json()["items"]
    if items:
        item_id = items[0]["id"]
        del_resp = client.delete(f"/api/v1/cart/items/{item_id}", headers=user_headers)
        assert del_resp.status_code == 200
        assert len(del_resp.json()["items"]) == 0


def test_unauthenticated_cart_access(client):
    response = client.get("/api/v1/cart")
    assert response.status_code == 401
