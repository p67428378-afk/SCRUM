def test_place_order_success(client, customer_headers):
    # Get available menu items
    menu_resp = client.get("/api/v1/menu/items")
    assert menu_resp.status_code == 200
    menu_items = menu_resp.json()
    item1 = menu_items[0]
    item2 = menu_items[1]

    order_payload = {
        "items": [
            {"menu_item_id": item1["id"], "quantity": 2},
            {"menu_item_id": item2["id"], "quantity": 1},
        ],
        "delivery_address_text": "123 Hill Road, Bandra West, Mumbai 400050",
        "special_instructions": "Please make it extra spicy",
    }

    response = client.post(
        "/api/v1/orders", json=order_payload, headers=customer_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "Placed"
    assert data["order_number"].startswith("#BD-")
    assert data["delivery_fee"] == 3.00

    expected_items_total = round((item1["price"] * 2) + (item2["price"] * 1), 2)
    expected_grand_total = round(expected_items_total + 3.00, 2)
    assert data["total_amount"] == expected_grand_total
    assert len(data["items"]) == 2


def test_get_my_orders(client, customer_headers):
    response = client.get("/api/v1/orders/my-orders", headers=customer_headers)
    assert response.status_code == 200
    orders = response.json()
    assert isinstance(orders, list)
    assert len(orders) >= 1


def test_order_tracking_and_status_transition(client, customer_headers, admin_headers):
    # Place an order
    menu_resp = client.get("/api/v1/menu/items")
    item = menu_resp.json()[0]

    order_payload = {
        "items": [{"menu_item_id": item["id"], "quantity": 1}],
        "delivery_address_text": "789 Carter Road, Bandra West, Mumbai 400050",
    }

    place_resp = client.post(
        "/api/v1/orders", json=order_payload, headers=customer_headers
    )
    assert place_resp.status_code == 201
    order_id = place_resp.json()["id"]

    # Customer checks order tracking
    track_resp = client.get(f"/api/v1/orders/{order_id}", headers=customer_headers)
    assert track_resp.status_code == 200
    assert track_resp.json()["status"] == "Placed"

    # Staff updates status to "Preparing"
    status_resp = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "Preparing"},
        headers=admin_headers,
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "Preparing"

    # Customer re-checks order tracking
    track_resp2 = client.get(f"/api/v1/orders/{order_id}", headers=customer_headers)
    assert track_resp2.status_code == 200
    assert track_resp2.json()["status"] == "Preparing"


def test_staff_dashboard(client, admin_headers):
    response = client.get("/api/v1/orders/staff/dashboard", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "orders" in data
    assert "status_counts" in data
    assert "menu_availability_items" in data


def test_customer_cannot_update_order_status(client, customer_headers):
    # Try updating status as customer
    response = client.patch(
        "/api/v1/orders/some-id/status",
        json={"status": "Delivered"},
        headers=customer_headers,
    )
    assert response.status_code == 403
