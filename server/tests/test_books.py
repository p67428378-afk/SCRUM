def test_get_categories(client):
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    categories = response.json()
    assert isinstance(categories, list)
    assert len(categories) >= 3
    names = [c["name"] for c in categories]
    assert "Technology" in names
    assert "Fiction" in names
    assert "Science" in names


def test_get_books_catalog(client):
    response = client.get("/api/v1/books")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 5
    assert len(data["items"]) >= 5


def test_search_books_by_title_and_keyword(client):
    # Search for "Python"
    response = client.get("/api/v1/books?query=Python")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("Python" in book["title"] for book in data["items"])

    # Search for "Martin" (author search)
    response_author = client.get("/api/v1/books?query=Martin")
    assert response_author.status_code == 200
    data_author = response_author.json()
    assert data_author["total"] >= 1
    assert any("Martin" in book["author"] for book in data_author["items"])

    # Search by ISBN
    response_isbn = client.get("/api/v1/books?query=978-0132350884")
    assert response_isbn.status_code == 200
    data_isbn = response_isbn.json()
    assert data_isbn["total"] == 1
    assert data_isbn["items"][0]["title"].startswith("Clean Code")


def test_filter_books_by_category(client):
    cats_resp = client.get("/api/v1/categories")
    categories = cats_resp.json()
    tech_cat = next(c for c in categories if c["name"] == "Technology")

    response = client.get(f"/api/v1/books?category_id={tech_cat['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    for b in data["items"]:
        assert b["category_id"] == tech_cat["id"]


def test_books_pagination(client):
    response = client.get("/api/v1/books?skip=0&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["skip"] == 0
    assert data["limit"] == 2


def test_get_book_details_success(client):
    catalog_resp = client.get("/api/v1/books?limit=1")
    book = catalog_resp.json()["items"][0]
    book_id = book["id"]

    response = client.get(f"/api/v1/books/{book_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == book_id
    assert data["title"] == book["title"]
    assert "stock_quantity" in data
    assert "price" in data
    assert "rating" in data
    assert "summary" in data


def test_get_book_details_not_found(client):
    response = client.get("/api/v1/books/non-existent-uuid")
    assert response.status_code == 404
    assert response.json()["detail"] == "Book not found"


def test_admin_create_and_delete_book(client, admin_headers, user_headers):
    cats_resp = client.get("/api/v1/categories")
    cat_id = cats_resp.json()[0]["id"]

    new_book_payload = {
        "title": "Refactoring: Improving the Design of Existing Code",
        "author": "Martin Fowler",
        "isbn": "978-0134757599",
        "category_id": cat_id,
        "price": 38.00,
        "stock_quantity": 10,
        "rating": 4.8,
        "summary": "Understand the principles of refactoring and how to create clean, maintainable software.",
    }

    # Regular user is forbidden
    unauth_resp = client.post(
        "/api/v1/books", json=new_book_payload, headers=user_headers
    )
    assert unauth_resp.status_code == 403

    # Admin creates successfully
    auth_resp = client.post(
        "/api/v1/books", json=new_book_payload, headers=admin_headers
    )
    assert auth_resp.status_code == 201
    created_book = auth_resp.json()
    created_id = created_book["id"]
    assert created_book["title"] == new_book_payload["title"]

    # Admin updates
    update_resp = client.put(
        f"/api/v1/books/{created_id}", json={"price": 35.00}, headers=admin_headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["price"] == 35.00

    # Admin deletes
    del_resp = client.delete(f"/api/v1/books/{created_id}", headers=admin_headers)
    assert del_resp.status_code == 204
