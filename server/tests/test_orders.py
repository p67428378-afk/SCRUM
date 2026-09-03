def test_create_order_success(client):
    # Fetch menu items and table
    menu_res = client.get("/api/v1/menu")
    menu_items = menu_res.json()
    tables_res = client.get("/api/v1/tables")
    tables = tables_res.json()

    available_item = next(i for i in menu_items if i["is_available"])
    table_id = tables[0]["id"]

    payload = {
        "table_id": table_id,
        "items": [{"menu_item_id": available_item["id"], "quantity": 2}],
    }

    res = client.post("/api/v1/orders", json=payload)
    assert res.status_code == 201
    order = res.json()
    assert "order_number" in order
    assert order["table_id"] == table_id
    assert order["status"] == "Pending"
    assert len(order["items"]) == 1

    expected_subtotal = round(available_item["price"] * 2, 2)
    expected_tax = round(expected_subtotal * 0.08, 2)
    expected_total = round(expected_subtotal + expected_tax, 2)

    assert order["subtotal"] == expected_subtotal
    assert order["tax"] == expected_tax
    assert order["total_price"] == expected_total


def test_create_order_out_of_stock_item_fails(client):
    # Create an unavailable menu item
    item_payload = {
        "name": "Out of Stock Muffin",
        "category": "Food",
        "price": 3.00,
        "is_available": False,
    }
    menu_item = client.post("/api/v1/menu", json=item_payload).json()

    order_payload = {"items": [{"menu_item_id": menu_item["id"], "quantity": 1}]}

    res = client.post("/api/v1/orders", json=order_payload)
    assert res.status_code == 400
    assert "out of stock" in res.json()["detail"].lower()


def test_update_order_status(client):
    menu_res = client.get("/api/v1/menu")
    item = menu_res.json()[0]

    order_payload = {"items": [{"menu_item_id": item["id"], "quantity": 1}]}
    order = client.post("/api/v1/orders", json=order_payload).json()

    # Update to Preparing
    res = client.patch(
        f"/api/v1/orders/{order['id']}/status", json={"status": "Preparing"}
    )
    assert res.status_code == 200
    assert res.json()["status"] == "Preparing"

    # Update to Ready
    res = client.patch(f"/api/v1/orders/{order['id']}/status", json={"status": "Ready"})
    assert res.status_code == 200
    assert res.json()["status"] == "Ready"

    # Update to Completed
    res = client.patch(
        f"/api/v1/orders/{order['id']}/status", json={"status": "Completed"}
    )
    assert res.status_code == 200
    assert res.json()["status"] == "Completed"


def test_get_orders_list_and_filter(client):
    res = client.get("/api/v1/orders")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    filtered_res = client.get("/api/v1/orders?status=Completed")
    assert filtered_res.status_code == 200
    for order in filtered_res.json():
        assert order["status"].lower() == "completed"
