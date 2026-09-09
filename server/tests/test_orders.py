def test_create_order(client):
    res = client.get("/api/v1/teas")
    jasmine = next(t for t in res.json() if t["name"] == "Jasmine Pearls")

    order_payload = {
        "items": [
            {
                "tea_id": jasmine["id"],
                "quantity": 2,
                "sweetness_level": "50%",
                "temperature": "Iced",
                "milk_option": "Oat",
                "add_ons": ["Boba"],
            }
        ]
    }

    response = client.post("/api/v1/orders", json=order_payload)
    assert response.status_code == 201
    data = response.json()
    assert "order_number" in data
    assert data["status"] == "COMPLETED"
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 2

    # Verify inventory deduction (2 items * 10g = 20g deducted)
    updated_tea = client.get(f"/api/v1/teas/{jasmine['id']}").json()
    assert updated_tea["current_stock_grams"] == 1180.0


def test_create_order_insufficient_stock(client):
    res = client.get("/api/v1/teas")
    tea = res.json()[0]

    order_payload = {
        "items": [
            {
                "tea_id": tea["id"],
                "quantity": 100000,
                "sweetness_level": "100%",
                "temperature": "Hot",
                "milk_option": "None",
                "add_ons": [],
            }
        ]
    }

    response = client.post("/api/v1/orders", json=order_payload)
    assert response.status_code == 400
    assert "Insufficient stock" in response.json()["detail"]


def test_list_orders(client):
    res = client.get("/api/v1/teas")
    jasmine = next(t for t in res.json() if t["name"] == "Jasmine Pearls")

    order_payload = {
        "items": [
            {
                "tea_id": jasmine["id"],
                "quantity": 1,
                "sweetness_level": "100%",
                "temperature": "Hot",
                "milk_option": "None",
                "add_ons": [],
            }
        ]
    }
    client.post("/api/v1/orders", json=order_payload)

    response = client.get("/api/v1/orders")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1
