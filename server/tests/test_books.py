def test_list_books_public(client):
    response = client.get("/api/v1/books")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)
    assert len(books) >= 4


def test_search_and_filter_books(client):
    # Search by title
    res_title = client.get("/api/v1/books?query=Clean")
    assert res_title.status_code == 200
    results = res_title.json()
    assert len(results) >= 2
    assert any("Clean" in b["title"] for b in results)

    # Filter by category
    res_cat = client.get("/api/v1/books?category=Software Engineering")
    assert res_cat.status_code == 200
    results_cat = res_cat.json()
    assert len(results_cat) >= 1
    assert all(b["category"] == "Software Engineering" for b in results_cat)


def test_get_book_by_id(client):
    books = client.get("/api/v1/books").json()
    book_id = books[0]["id"]

    response = client.get(f"/api/v1/books/{book_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == book_id
    assert "isbn" in data
    assert "available_copies" in data


def test_get_book_not_found(client):
    response = client.get("/api/v1/books/non-existent-id-000")
    assert response.status_code == 404


def test_create_book_as_staff(client, staff_headers):
    payload = {
        "isbn": "978-0131103627",
        "title": "The C Programming Language",
        "author": "Brian W. Kernighan, Dennis M. Ritchie",
        "category": "Programming",
        "total_copies": 3,
    }
    response = client.post("/api/v1/books", json=payload, headers=staff_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["isbn"] == payload["isbn"]
    assert data["total_copies"] == 3
    assert data["available_copies"] == 3


def test_create_book_unauthorized_patron(client, patron_headers):
    payload = {
        "isbn": "978-0000000000",
        "title": "Unauthorized Book",
        "author": "Hacker",
        "category": "Testing",
        "total_copies": 1,
    }
    response = client.post("/api/v1/books", json=payload, headers=patron_headers)
    assert response.status_code == 403


def test_update_book(client, admin_headers):
    books = client.get("/api/v1/books").json()
    book_id = books[0]["id"]

    response = client.put(
        f"/api/v1/books/{book_id}",
        json={"title": "Updated Title Name", "total_copies": 10},
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title Name"
    assert response.json()["total_copies"] == 10


def test_delete_book_without_loans(client, admin_headers):
    create_res = client.post(
        "/api/v1/books",
        json={
            "isbn": "978-1111111111",
            "title": "Temporary Book for Deletion",
            "author": "Temp Author",
            "category": "Test",
            "total_copies": 2,
        },
        headers=admin_headers,
    )
    book_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/books/{book_id}", headers=admin_headers)
    assert del_res.status_code == 204

    get_res = client.get(f"/api/v1/books/{book_id}")
    assert get_res.status_code == 404
