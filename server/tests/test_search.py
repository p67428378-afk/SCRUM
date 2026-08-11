def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_search_products_basic(client):
    response = client.get("/api/v1/products/search?q=running&limit=10&page=1")
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "running"
    assert data["total"] > 0
    assert len(data["suggestions"]) > 0
    assert "took_ms" in data
    assert data["took_ms"] < 150  # p95 SLA requirement check

    first_item = data["suggestions"][0]
    assert "id" in first_item
    assert "title" in first_item
    assert "price" in first_item
    assert "tags" in first_item


def test_search_products_category_filter(client):
    # First fetch categories
    cat_response = client.get("/api/v1/categories")
    assert cat_response.status_code == 200
    categories = cat_response.json()
    assert len(categories) > 0

    footwear_cat = next(
        (c for c in categories if c["slug"] == "footwear"), categories[0]
    )

    response = client.get(
        f"/api/v1/products/search?q=shoes&category_id={footwear_cat['id']}"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for suggestion in data["suggestions"]:
        assert suggestion["category_id"] == footwear_cat["id"]


def test_search_short_query(client):
    response = client.get("/api/v1/products/search?q=xy")
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "xy"
    assert data["total"] == 0
    assert len(data["suggestions"]) == 0


def test_search_no_results(client):
    response = client.get("/api/v1/products/search?q=xyz123")
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "xyz123"
    assert data["total"] == 0
    assert len(data["suggestions"]) == 0


def test_search_pagination(client):
    response = client.get("/api/v1/products/search?q=a&limit=2&page=1")
    assert response.status_code == 200
    data = response.json()
    assert data["limit"] == 2
    assert data["page"] == 1
    assert len(data["suggestions"]) <= 2
