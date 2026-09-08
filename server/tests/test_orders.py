def test_checkout_empty_cart_fails(client, user_headers):
    # Ensure cart is empty
    client.delete("/api/v1/cart", headers=user_headers)

    response = client.post(
        "/api/v1/orders/checkout",
        json={
            "shipping_address": {
                "full_name": "Alex Morgan",
                "street_address": "123 Book Lane",
                "city": "Seattle",
                "state": "WA",
                "postal_code": "98101",
                "country": "USA",
            }
        },
        headers=user_headers,
    )

    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_checkout_successful_workflow(client, user_headers):
    # 1. Fetch a book with known stock
    books_resp = client.get("/api/v1/books?query=Clean+Code")
    book = books_resp.json()["items"][0]
    book_id = book["id"]
    initial_stock = book["stock_quantity"]

    # 2. Add 2 copies to cart
    add_resp = client.post(
        "/api/v1/cart/items",
        json={"book_id": book_id, "quantity": 2},
        headers=user_headers,
    )
    assert add_resp.status_code == 200

    # 3. Perform checkout
    shipping_payload = {
        "shipping_address": {
            "full_name": "Alex Morgan",
            "street_address": "456 Library Way",
            "city": "Portland",
            "state": "OR",
            "postal_code": "97201",
            "country": "USA",
        },
        "payment_method": {
            "card_holder": "Alex Morgan",
            "card_number_last4": "4242",
            "payment_type": "Credit Card",
        },
    }

    checkout_resp = client.post(
        "/api/v1/orders/checkout", json=shipping_payload, headers=user_headers
    )
    assert checkout_resp.status_code == 201
    order_data = checkout_resp.json()

    assert "id" in order_data
    assert order_data["status"] == "Processing"
    assert order_data["subtotal"] == round(book["price"] * 2, 2)
    assert order_data["tax_amount"] > 0
    assert order_data["total_amount"] > order_data["subtotal"]
    assert len(order_data["order_items"]) == 1
    assert order_data["order_items"][0]["book_id"] == book_id
    assert order_data["order_items"][0]["quantity"] == 2

    # 4. Verify book stock was decremented
    updated_book_resp = client.get(f"/api/v1/books/{book_id}")
    assert updated_book_resp.json()["stock_quantity"] == initial_stock - 2

    # 5. Verify cart is now empty
    cart_resp = client.get("/api/v1/cart", headers=user_headers)
    assert cart_resp.json()["items"] == []
    assert cart_resp.json()["item_count"] == 0

    # 6. Verify order appears in order history
    orders_resp = client.get("/api/v1/orders", headers=user_headers)
    assert orders_resp.status_code == 200
    orders_list = orders_resp.json()
    assert any(o["id"] == order_data["id"] for o in orders_list)

    # 7. Verify order details view
    order_id = order_data["id"]
    detail_resp = client.get(f"/api/v1/orders/{order_id}", headers=user_headers)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["id"] == order_id
    assert detail_resp.json()["shipping_address"]["city"] == "Portland"


def test_unauthenticated_orders_endpoints(client):
    assert client.get("/api/v1/orders").status_code == 401
    assert client.post("/api/v1/orders/checkout", json={}).status_code == 401
