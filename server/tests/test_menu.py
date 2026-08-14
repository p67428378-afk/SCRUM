def test_list_categories(client):
    response = client.get("/api/v1/menu/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    category_names = [c["name"] for c in data]
    assert "Main Course" in category_names


def test_list_menu_items(client):
    response = client.get("/api/v1/menu/items")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    item_names = [i["name"] for c in items for i in [c]]
    assert "Butter Chicken" in item_names


def test_filter_menu_items_by_dietary_tag(client):
    response = client.get("/api/v1/menu/items?dietary_tag=Veg")
    assert response.status_code == 200
    items = response.json()
    for item in items:
        assert "Veg" in item["dietary_tags"]


def test_create_and_update_menu_item_staff(client, admin_headers):
    # Get a category ID
    cat_resp = client.get("/api/v1/menu/categories")
    cat_id = cat_resp.json()[0]["id"]

    item_payload = {
        "category_id": cat_id,
        "name": "Special Mutton Curry",
        "description": "Slow cooked mutton with secret spices",
        "price": 18.50,
        "image_url": "https://example.com/mutton.jpg",
        "dietary_tags": "Non-Veg,Chef Special",
        "is_available": True,
    }

    response = client.post(
        "/api/v1/menu/items", json=item_payload, headers=admin_headers
    )
    assert response.status_code == 201
    created_item = response.json()
    assert created_item["name"] == "Special Mutton Curry"
    item_id = created_item["id"]

    # Update item
    update_payload = {"price": 19.99, "is_available": False}
    update_resp = client.put(
        f"/api/v1/menu/items/{item_id}", json=update_payload, headers=admin_headers
    )
    assert update_resp.status_code == 200
    updated_item = update_resp.json()
    assert updated_item["price"] == 19.99
    assert updated_item["is_available"] is False


def test_create_menu_item_customer_forbidden(client, customer_headers):
    cat_resp = client.get("/api/v1/menu/categories")
    cat_id = cat_resp.json()[0]["id"]

    item_payload = {
        "category_id": cat_id,
        "name": "Forbidden Item",
        "price": 10.00,
    }

    response = client.post(
        "/api/v1/menu/items", json=item_payload, headers=customer_headers
    )
    assert response.status_code == 403
