def test_get_books_catalog(client):
    res = client.get("/api/v1/books")
    assert res.status_code == 200
    books = res.json()
    assert isinstance(books, list)
    assert len(books) >= 5


def test_search_books_by_keyword(client):
    res = client.get("/api/v1/books?q=Clean Code")
    assert res.status_code == 200
    books = res.json()
    assert len(books) >= 1
    assert any("Clean Code" in b["title"] for b in books)


def test_filter_books_by_genre(client):
    res = client.get("/api/v1/books?genre=Fiction")
    assert res.status_code == 200
    books = res.json()
    assert len(books) >= 1
    assert all("Fiction" in b["genre"] for b in books)


def test_filter_books_by_status_and_pagination(client):
    res = client.get("/api/v1/books?status=available&skip=0&limit=2")
    assert res.status_code == 200
    books = res.json()
    assert len(books) <= 2
    assert all(b["available_copies"] > 0 for b in books)


def test_get_book_by_id(client):
    res_list = client.get("/api/v1/books")
    first_book = res_list.json()[0]

    res = client.get(f"/api/v1/books/{first_book['id']}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == first_book["id"]
    assert data["title"] == first_book["title"]


def test_get_nonexistent_book_404(client):
    res = client.get("/api/v1/books/non-existent-id")
    assert res.status_code == 404
    assert "Book not found" in res.json()["detail"]


def test_create_book_admin_and_rbac(client, admin_headers, patron_headers):
    new_book_payload = {
        "title": "Refactoring: Improving the Design of Existing Code",
        "author": "Martin Fowler",
        "isbn": "9780134757599",
        "genre": "Software Engineering",
        "total_copies": 3,
        "available_copies": 3,
    }

    # Patron attempting to create book gets 403
    res_patron = client.post(
        "/api/v1/books", json=new_book_payload, headers=patron_headers
    )
    assert res_patron.status_code == 403

    # Admin successfully creates book
    res_admin = client.post(
        "/api/v1/books", json=new_book_payload, headers=admin_headers
    )
    assert res_admin.status_code == 201
    created_book = res_admin.json()
    assert created_book["title"] == new_book_payload["title"]
    assert created_book["isbn"] == new_book_payload["isbn"]
    assert created_book["total_copies"] == 3
    assert created_book["available_copies"] == 3

    # Duplicate ISBN rejected with 409
    res_dup = client.post("/api/v1/books", json=new_book_payload, headers=admin_headers)
    assert res_dup.status_code == 409


def test_update_book(client, admin_headers, patron_headers):
    # Fetch a book
    res_list = client.get("/api/v1/books")
    book = res_list.json()[0]

    # Patron cannot update
    res_patron = client.put(
        f"/api/v1/books/{book['id']}",
        json={"title": "Updated Title"},
        headers=patron_headers,
    )
    assert res_patron.status_code == 403

    # Admin updates
    res_admin = client.put(
        f"/api/v1/books/{book['id']}",
        json={"total_copies": 10},
        headers=admin_headers,
    )
    assert res_admin.status_code == 200
    assert res_admin.json()["total_copies"] == 10
