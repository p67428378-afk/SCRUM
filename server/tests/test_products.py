def test_list_products(client):
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] > 0


def test_filter_products_by_category(client):
    response = client.get("/api/v1/products?category=clothing")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0


def test_search_products_by_keyword(client):
    response = client.get("/api/v1/products?q=denim")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    assert "denim" in data["items"][0]["title"].lower()


def test_get_product_details(client):
    # First get product list to get a valid product_id
    list_res = client.get("/api/v1/products")
    product_id = list_res.json()["items"][0]["id"]

    detail_res = client.get(f"/api/v1/products/{product_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["id"] == product_id
    assert "variants" in detail_data
    assert len(detail_data["variants"]) > 0


def test_get_product_not_found(client):
    response = client.get("/api/v1/products/non-existent-uuid")
    assert response.status_code == 404
