def test_list_categories(client):
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 4
    slugs = [c["slug"] for c in categories]
    assert "living-room" in slugs
    assert "bedroom" in slugs
    assert "office" in slugs
    assert "dining" in slugs


def test_create_category(client):
    response = client.post(
        "/api/v1/categories",
        json={
            "name": "Outdoor & Patio",
            "slug": "outdoor-patio",
            "description": "Weather-resistant outdoor teak chairs and tables",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Outdoor & Patio"
    assert data["slug"] == "outdoor-patio"


def test_list_products_all(client):
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 9
    assert len(data["items"]) >= 9


def test_filter_products_by_category(client):
    response = client.get("/api/v1/products?category=living-room")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert item["category"]["slug"] == "living-room"


def test_filter_products_by_price_range(client):
    response = client.get("/api/v1/products?min_price=300&max_price=700")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert 300 <= item["price"] <= 700


def test_filter_products_by_material(client):
    response = client.get("/api/v1/products?material=Oak")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert "oak" in item["material"].lower()


def test_filter_products_by_rating(client):
    response = client.get("/api/v1/products?rating=4.8")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert item["rating"] >= 4.8


def test_search_products_keyword(client):
    response = client.get("/api/v1/products?search=sofa")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    names = [i["name"].lower() for i in data["items"]]
    assert any("sofa" in n for n in names)


def test_sort_products_price(client):
    response = client.get("/api/v1/products?sort=price_asc")
    assert response.status_code == 200
    items = response.json()["items"]
    prices = [i["price"] for i in items]
    assert prices == sorted(prices)


def test_get_product_detail(client):
    # Fetch list to get a valid product ID
    list_res = client.get("/api/v1/products")
    product_id = list_res.json()["items"][0]["id"]

    res = client.get(f"/api/v1/products/{product_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == product_id
    assert "finish_options" in data
    assert "dimension_options" in data
    assert "stock_quantity" in data
    assert isinstance(data["finish_options"], list)
    assert isinstance(data["dimension_options"], list)


def test_get_product_not_found(client):
    res = client.get("/api/v1/products/non-existent-id-12345")
    assert res.status_code == 404
