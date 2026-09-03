def test_get_orders(client):
    response = client.get("/api/v1/orders")
    assert response.status_code == 200
    orders = response.json()
    assert isinstance(orders, list)


def test_create_order_success(client):
    # Get available menu item
    menu_res = client.get("/api/v1/menu?available_only=true")
    items = menu_res.json()
    assert len(items) > 0
    menu_item = items[0]

    # Get available table
    tables_res = client.get("/api/v1/tables")
    tables = tables_res.json()
    table_id = tables[0]["id"] if tables else None

    order_payload = {
        "table_id": table_id,
        "items": [{"menu_item_id": menu_item["id"], "quantity": 2}],
    }

    create_res = client.post("/api/v1/orders", json=order_payload)
    assert create_res.status_code == 201
    order = create_res.json()

    assert order["status"] == "Pending"
    expected_subtotal = round(menu_item["price"] * 2, 2)
    expected_tax = round(expected_subtotal * 0.08, 2)
    expected_total = round(expected_subtotal + expected_tax, 2)

    assert abs(order["subtotal"] - expected_subtotal) < 0.01
    assert abs(order["tax"] - expected_tax) < 0.01
    assert abs(order["total_price"] - expected_total) < 0.01


def test_create_order_out_of_stock_item_fails(client):
    # Get unavailable menu item
    menu_res = client.get("/api/v1/menu")
    items = menu_res.json()
    unavailable_item = next((i for i in items if not i["is_available"]), None)

    if not unavailable_item:
        # Create an unavailable item
        create_res = client.post(
            "/api/v1/menu",
            json={
                "name": "Out of Stock Soda",
                "category": "Beverages",
                "price": 2.50,
                "is_available": False,
            },
        )
        unavailable_item = create_res.json()

    order_payload = {"items": [{"menu_item_id": unavailable_item["id"], "quantity": 1}]}

    res = client.post("/api/v1/orders", json=order_payload)
    assert res.status_code == 400
    assert (
        "out of stock" in res.json()["detail"].lower()
        or "unavailable" in res.json()["detail"].lower()
    )


def test_update_order_status(client):
    menu_res = client.get("/api/v1/menu?available_only=true")
    item = menu_res.json()[0]

    create_res = client.post(
        "/api/v1/orders", json={"items": [{"menu_item_id": item["id"], "quantity": 1}]}
    )
    order_id = create_res.json()["id"]

    # Status transition
    patch_res = client.patch(
        f"/api/v1/orders/{order_id}/status", json={"status": "Preparing"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Preparing"

    ready_res = client.patch(
        f"/api/v1/orders/{order_id}/status", json={"status": "Ready"}
    )
    assert ready_res.status_code == 200
    assert ready_res.json()["status"] == "Ready"

    complete_res = client.patch(
        f"/api/v1/orders/{order_id}/status", json={"status": "Completed"}
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "Completed"
