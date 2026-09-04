def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_create_book_success(client):
    payload = {
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "isbn": "978-0132350884",
        "category": "Software Engineering",
        "publication_year": 2008,
        "price": 39.99,
        "stock_quantity": 15,
        "description": "A Handbook of Agile Software Craftsmanship",
    }
    response = client.post("/api/v1/books", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["isbn"] == payload["isbn"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_book_duplicate_isbn(client):
    payload = {
        "title": "Clean Code Duplicate",
        "author": "Robert C. Martin",
        "isbn": "978-0132350884",
        "category": "Software Engineering",
        "publication_year": 2008,
        "price": 39.99,
        "stock_quantity": 5,
        "description": "Duplicate test",
    }
    response = client.post("/api/v1/books", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Book with this ISBN already exists"


def test_create_book_negative_price(client):
    payload = {
        "title": "Invalid Price Book",
        "author": "Jane Doe",
        "isbn": "978-1111111111",
        "category": "Fiction",
        "publication_year": 2021,
        "price": -10.0,
        "stock_quantity": 5,
    }
    response = client.post("/api/v1/books", json=payload)
    assert response.status_code == 422


def test_create_book_negative_stock(client):
    payload = {
        "title": "Invalid Stock Book",
        "author": "Jane Doe",
        "isbn": "978-2222222222",
        "category": "Fiction",
        "publication_year": 2021,
        "price": 10.0,
        "stock_quantity": -5,
    }
    response = client.post("/api/v1/books", json=payload)
    assert response.status_code == 422


def test_get_book_success(client):
    create_payload = {
        "title": "The Pragmatic Programmer",
        "author": "Andrew Hunt, David Thomas",
        "isbn": "978-0201616224",
        "category": "Software Engineering",
        "publication_year": 1999,
        "price": 49.99,
        "stock_quantity": 8,
        "description": "Your Journey to Mastery",
    }
    create_res = client.post("/api/v1/books", json=create_payload)
    book_id = create_res.json()["id"]

    res = client.get(f"/api/v1/books/{book_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == book_id
    assert data["title"] == create_payload["title"]


def test_get_book_not_found(client):
    res = client.get("/api/v1/books/non-existent-uuid-12345")
    assert res.status_code == 404
    assert res.json()["detail"] == "Book not found"


def test_list_books_search_filter_pagination(client):
    # Book 1
    client.post(
        "/api/v1/books",
        json={
            "title": "Refactoring",
            "author": "Martin Fowler",
            "isbn": "978-0201485677",
            "category": "Software Engineering",
            "publication_year": 1999,
            "price": 45.0,
            "stock_quantity": 10,
        },
    )
    # Book 2 (Out of stock)
    client.post(
        "/api/v1/books",
        json={
            "title": "Domain-Driven Design",
            "author": "Eric Evans",
            "isbn": "978-0321125217",
            "category": "Architecture",
            "publication_year": 2003,
            "price": 55.0,
            "stock_quantity": 0,
        },
    )

    # Search keyword "Fowler"
    res = client.get("/api/v1/books?query=Fowler")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert any(b["title"] == "Refactoring" for b in data["items"])

    # Filter category "Architecture"
    res = client.get("/api/v1/books?category=Architecture")
    assert res.status_code == 200
    data = res.json()
    assert all(b["category"] == "Architecture" for b in data["items"])

    # Filter in_stock=true
    res = client.get("/api/v1/books?in_stock=true")
    assert res.status_code == 200
    data = res.json()
    assert all(b["stock_quantity"] > 0 for b in data["items"])

    # Pagination skip/limit
    res = client.get("/api/v1/books?skip=0&limit=1")
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 1
    assert data["limit"] == 1
    assert data["skip"] == 0


def test_update_book_success(client):
    create_res = client.post(
        "/api/v1/books",
        json={
            "title": "Original Title",
            "author": "Original Author",
            "isbn": "978-9999999999",
            "category": "Test",
            "publication_year": 2020,
            "price": 20.0,
            "stock_quantity": 5,
        },
    )
    book_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/v1/books/{book_id}",
        json={"title": "Updated Title", "price": 25.0, "stock_quantity": 12},
    )
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["title"] == "Updated Title"
    assert data["price"] == 25.0
    assert data["stock_quantity"] == 12


def test_update_book_duplicate_isbn(client):
    # Book A
    client.post(
        "/api/v1/books",
        json={
            "title": "Book A",
            "author": "Author A",
            "isbn": "978-3333333333",
            "category": "Test",
            "publication_year": 2020,
            "price": 10.0,
            "stock_quantity": 5,
        },
    )
    # Book B
    b_res = client.post(
        "/api/v1/books",
        json={
            "title": "Book B",
            "author": "Author B",
            "isbn": "978-4444444444",
            "category": "Test",
            "publication_year": 2020,
            "price": 15.0,
            "stock_quantity": 5,
        },
    )
    b_id = b_res.json()["id"]

    # Try updating Book B's ISBN to Book A's ISBN
    update_res = client.put(f"/api/v1/books/{b_id}", json={"isbn": "978-3333333333"})
    assert update_res.status_code == 400
    assert update_res.json()["detail"] == "Book with this ISBN already exists"


def test_update_book_not_found(client):
    res = client.put("/api/v1/books/non-existent-uuid", json={"title": "New Title"})
    assert res.status_code == 404
    assert res.json()["detail"] == "Book not found"


def test_delete_book_success(client):
    create_res = client.post(
        "/api/v1/books",
        json={
            "title": "To Be Deleted",
            "author": "Delete Author",
            "isbn": "978-5555555555",
            "category": "Test",
            "publication_year": 2020,
            "price": 10.0,
            "stock_quantity": 1,
        },
    )
    book_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/books/{book_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/v1/books/{book_id}")
    assert get_res.status_code == 404


def test_delete_book_not_found(client):
    res = client.delete("/api/v1/books/non-existent-uuid")
    assert res.status_code == 404
    assert res.json()["detail"] == "Book not found"
