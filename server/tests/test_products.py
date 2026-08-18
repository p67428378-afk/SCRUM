def test_list_products(client):
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    names = [p["name"] for p in data]
    assert "Butter Croissant" in names


def test_create_and_get_product(client):
    res = client.post(
        "/api/v1/products",
        json={
            "name": "Baguette",
            "category": "Bread",
            "price": 2.50,
            "description": "Crusty French Baguette",
        },
    )
    assert res.status_code == 201
    product = res.json()
    assert product["name"] == "Baguette"
    p_id = product["id"]

    get_res = client.get(f"/api/v1/products/{p_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Baguette"


def test_update_and_delete_product(client):
    res = client.post(
        "/api/v1/products",
        json={"name": "Muffin", "category": "Pastry", "price": 3.00},
    )
    p_id = res.json()["id"]

    update_res = client.put(
        f"/api/v1/products/{p_id}",
        json={"price": 3.50, "description": "Blueberry muffin"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["price"] == 3.50

    del_res = client.delete(f"/api/v1/products/{p_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/v1/products/{p_id}")
    assert get_res.status_code == 404
