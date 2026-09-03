def test_get_menu_items(client):
    response = client.get("/api/v1/menu")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) > 0


def test_filter_menu_by_category(client):
    response = client.get("/api/v1/menu?category=Beverages")
    assert response.status_code == 200
    items = response.json()
    assert all(item["category"].lower() == "beverages" for item in items)


def test_create_and_get_menu_item(client):
    payload = {
        "name": "Matcha Latte",
        "category": "Beverages",
        "price": 5.25,
        "description": "Japanese green tea latte",
        "is_available": True,
    }
    response = client.post("/api/v1/menu", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["name"] == "Matcha Latte"
    assert created["price"] == 5.25

    # Get by ID
    get_res = client.get(f"/api/v1/menu/{created['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Matcha Latte"


def test_update_and_toggle_menu_item(client):
    # First create
    payload = {
        "name": "Carrot Cake",
        "category": "Desserts",
        "price": 4.50,
        "description": "Slice of moist carrot cake",
        "is_available": True,
    }
    create_res = client.post("/api/v1/menu", json=payload)
    item_id = create_res.json()["id"]

    # Update price
    update_res = client.put(f"/api/v1/menu/{item_id}", json={"price": 5.00})
    assert update_res.status_code == 200
    assert update_res.json()["price"] == 5.00

    # Toggle availability
    toggle_res = client.patch(f"/api/v1/menu/{item_id}/availability?is_available=false")
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_available"] is False


def test_delete_menu_item(client):
    payload = {
        "name": "Temp Item",
        "category": "Food",
        "price": 1.00,
        "description": "To be deleted",
        "is_available": True,
    }
    create_res = client.post("/api/v1/menu", json=payload)
    item_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/menu/{item_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/v1/menu/{item_id}")
    assert get_res.status_code == 404
