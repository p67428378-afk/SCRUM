def test_list_books(client):
    response = client.get("/api/v1/books")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 3


def test_search_books(client):
    response = client.get("/api/v1/books?query=Clean")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) >= 1
    assert "Clean Code" in data["items"][0]["title"]


def test_create_book_librarian(client, librarian_headers):
    payload = {
        "isbn": "978-0134494166",
        "title": "Clean Architecture",
        "author": "Robert C. Martin",
        "genre": "Software Engineering",
        "total_copies": 4,
    }
    response = client.post("/api/v1/books", json=payload, headers=librarian_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Clean Architecture"
    assert data["available_copies"] == 4


def test_create_book_member_forbidden(client, member_headers):
    payload = {
        "isbn": "978-0000000000",
        "title": "Unauthorized Book",
        "author": "Nobody",
        "genre": "Fiction",
        "total_copies": 1,
    }
    response = client.post("/api/v1/books", json=payload, headers=member_headers)
    assert response.status_code == 403


def test_create_duplicate_isbn(client, librarian_headers):
    payload = {
        "isbn": "978-0132350884",  # Already seeded
        "title": "Duplicate Clean Code",
        "author": "Robert C. Martin",
        "genre": "Software Engineering",
        "total_copies": 2,
    }
    response = client.post("/api/v1/books", json=payload, headers=librarian_headers)
    assert response.status_code == 400


def test_get_book_by_id(client):
    list_res = client.get("/api/v1/books")
    book_id = list_res.json()["items"][0]["id"]

    response = client.get(f"/api/v1/books/{book_id}")
    assert response.status_code == 200
    assert response.json()["id"] == book_id


def test_update_book(client, librarian_headers):
    list_res = client.get("/api/v1/books")
    book_id = list_res.json()["items"][0]["id"]

    update_payload = {"title": "Clean Code - Second Edition"}
    response = client.put(
        f"/api/v1/books/{book_id}", json=update_payload, headers=librarian_headers
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Clean Code - Second Edition"
