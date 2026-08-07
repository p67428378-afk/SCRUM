def get_admin_token(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    return resp.json()["access_token"]


def get_patron_token(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    return resp.json()["access_token"]


def test_book_search(client):
    response = client.get("/api/v1/books")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)


def test_librarian_book_crud_and_patron_rbac(client):
    admin_token = get_admin_token(client)
    patron_token = get_patron_token(client)

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    patron_headers = {"Authorization": f"Bearer {patron_token}"}

    # Patron attempting to create a book -> 403 Forbidden
    book_payload = {
        "title": "Test Book",
        "author": "Test Author",
        "category": "Fiction",
        "isbn": "111-2223334445",
        "status": "AVAILABLE",
    }
    patron_create = client.post(
        "/api/v1/books", json=book_payload, headers=patron_headers
    )
    assert patron_create.status_code == 403

    # Librarian creates a book -> 201 Created
    admin_create = client.post(
        "/api/v1/books", json=book_payload, headers=admin_headers
    )
    assert admin_create.status_code == 201
    created_book = admin_create.json()
    book_id = created_book["id"]

    # Search by title
    search_resp = client.get("/api/v1/books?query=Test Book")
    assert search_resp.status_code == 200
    assert len(search_resp.json()) >= 1

    # Librarian updates book -> 200 OK
    update_payload = {"title": "Updated Test Book", "status": "MAINTENANCE"}
    admin_update = client.put(
        f"/api/v1/books/{book_id}", json=update_payload, headers=admin_headers
    )
    assert admin_update.status_code == 200
    assert admin_update.json()["title"] == "Updated Test Book"
    assert admin_update.json()["status"] == "MAINTENANCE"

    # Librarian deletes book -> 204 No Content
    admin_delete = client.delete(f"/api/v1/books/{book_id}", headers=admin_headers)
    assert admin_delete.status_code == 204
