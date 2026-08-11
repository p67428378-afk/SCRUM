def test_list_categories(client):
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    categories = response.json()
    assert isinstance(categories, list)
    assert len(categories) >= 4


def test_create_category(client):
    payload = {"name": "Accessories & Bags", "slug": "accessories-bags"}
    response = client.post("/api/v1/categories", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Accessories & Bags"
    assert data["slug"] == "accessories-bags"
    assert "id" in data


def test_list_products(client):
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    assert len(products) >= 6


def test_create_and_get_product(client):
    cat_response = client.get("/api/v1/categories")
    cat_id = cat_response.json()[0]["id"]

    prod_payload = {
        "title": "Test Performance Jacket",
        "description": "Lightweight windproof jacket.",
        "price": 119.99,
        "thumbnail_url": "https://example.com/jacket.jpg",
        "tags": ["test", "jacket", "windproof"],
        "category_id": cat_id,
    }

    create_resp = client.post("/api/v1/products", json=prod_payload)
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    assert created_data["title"] == "Test Performance Jacket"
    prod_id = created_data["id"]

    get_resp = client.get(f"/api/v1/products/{prod_id}")
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert get_data["id"] == prod_id
    assert get_data["title"] == "Test Performance Jacket"
    assert "test" in get_data["tags"]
