def test_get_menu_items(client):
    response = client.get("/api/v1/menu")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 8  # seeded items exist


def test_get_menu_items_filter_category(client):
    response = client.get("/api/v1/menu?category=Beverages")
    assert response.status_code == 200
    data = response.json()
    for item in data:
        assert item["category"].lower() == "beverages"


def test_create_and_get_menu_item(client):
    payload = {
        "name": "Matcha Latte",
        "category": "Beverages",
        "price": 5.00,
        "description": "Japanese ceremonial matcha with oat milk",
        "is_available": True,
    }
    response = client.post("/api/v1/menu", json=payload)
    assert response.status_code == 201
    item = response.json()
    assert item["name"] == "Matcha Latte"
    assert item["price"] == 5.00
    assert "id" in item

    # Get created item
    get_res = client.get(f"/api/v1/menu/{item['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Matcha Latte"


def test_update_menu_item_availability_and_price(client):
    # Create item
    payload = {
        "name": "Iced Mocha",
        "category": "Beverages",
        "price": 4.50,
        "is_available": True,
    }
    res = client.post("/api/v1/menu", json=payload)
    item_id = res.json()["id"]

    # Update item price and toggle availability off
    update_payload = {"price": 5.25, "is_available": False}
    update_res = client.patch(f"/api/v1/menu/{item_id}", json=update_payload)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["price"] == 5.25
    assert updated_data["is_available"] is False


def test_delete_menu_item(client):
    payload = {
        "name": "Temp Item",
        "category": "Food",
        "price": 2.00,
        "is_available": True,
    }
    res = client.post("/api/v1/menu", json=payload)
    item_id = res.json()["id"]

    del_res = client.delete(f"/api/v1/menu/{item_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/v1/menu/{item_id}")
    assert get_res.status_code == 404
