def test_get_products(client):
    res = client.get("/api/v1/products")
    assert res.status_code == 200
    products = res.json()
    assert isinstance(products, list)
    assert len(products) >= 1


def test_get_product_detail(client):
    products_res = client.get("/api/v1/products")
    product_id = products_res.json()[0]["id"]

    res = client.get(f"/api/v1/products/{product_id}")
    assert res.status_code == 200
    assert res.json()["id"] == product_id


def test_get_nonexistent_product(client):
    res = client.get("/api/v1/products/non-existent-id")
    assert res.status_code == 404
