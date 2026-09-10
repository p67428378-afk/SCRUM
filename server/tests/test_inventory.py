def test_list_inventory(client, auth_headers):
    response = client.get("/api/v1/inventory", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_create_inventory_negative_quantity_rejected(client, auth_headers):
    response = client.post(
        "/api/v1/inventory",
        json={
            "item_name": "Organic Fertilizer",
            "category": "Fertilizer",
            "quantity": -10.0,
            "unit": "bags",
            "reorder_threshold": 5.0,
        },
        headers=auth_headers,
    )
    # Pydantic schema validation returns 422 or route logic returns 400
    assert response.status_code in [400, 422]


def test_adjust_inventory_stock_success(client, auth_headers):
    item_res = client.post(
        "/api/v1/inventory",
        json={
            "item_name": "Diesel Fuel",
            "category": "Fuel",
            "quantity": 500.0,
            "unit": "liters",
            "reorder_threshold": 100.0,
        },
        headers=auth_headers,
    )
    item_id = item_res.json()["id"]

    response = client.patch(
        f"/api/v1/inventory/{item_id}/adjust",
        json={"quantity_delta": -200.0, "reason_notes": "Tractor fueling"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 300.0


def test_adjust_inventory_negative_total_rejected(client, auth_headers):
    item_res = client.post(
        "/api/v1/inventory",
        json={
            "item_name": "Pesticide Spray X",
            "category": "Pesticides",
            "quantity": 20.0,
            "unit": "bottles",
            "reorder_threshold": 5.0,
        },
        headers=auth_headers,
    )
    item_id = item_res.json()["id"]

    # Try to reduce by 50 when quantity is 20 -> -30
    response = client.patch(
        f"/api/v1/inventory/{item_id}/adjust",
        json={"quantity_delta": -50.0},
        headers=auth_headers,
    )
    assert response.status_code == 400
    assert (
        "Negative inventory quantities are strictly rejected"
        in response.json()["detail"]
    )
