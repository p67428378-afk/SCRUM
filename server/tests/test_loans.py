def test_checkout_book_success(client, member_headers):
    # Get a book ID
    list_res = client.get("/api/v1/books")
    book = list_res.json()["items"][0]

    checkout_res = client.post(
        "/api/v1/loans/checkout",
        json={"book_id": book["id"]},
        headers=member_headers,
    )
    assert checkout_res.status_code == 201
    loan = checkout_res.json()
    assert loan["status"] == "ACTIVE"
    assert loan["is_renewed"] is False

    # Check available copies decremented
    updated_book_res = client.get(f"/api/v1/books/{book['id']}")
    assert updated_book_res.json()["available_copies"] == book["available_copies"] - 1


def test_renew_loan_success(client, member_headers):
    # Get user's active loans
    my_loans_res = client.get("/api/v1/loans/my-loans", headers=member_headers)
    loans = my_loans_res.json()
    assert len(loans) > 0
    loan_id = loans[0]["id"]

    renew_res = client.post(f"/api/v1/loans/renew/{loan_id}", headers=member_headers)
    assert renew_res.status_code == 200
    renewed_loan = renew_res.json()
    assert renewed_loan["is_renewed"] is True


def test_renew_loan_twice_fails(client, member_headers):
    my_loans_res = client.get("/api/v1/loans/my-loans", headers=member_headers)
    loans = my_loans_res.json()
    loan_id = loans[0]["id"]

    renew_res = client.post(f"/api/v1/loans/renew/{loan_id}", headers=member_headers)
    assert renew_res.status_code == 400
    assert "already been renewed" in renew_res.json()["detail"]


def test_return_book_success(client, member_headers):
    my_loans_res = client.get("/api/v1/loans/my-loans", headers=member_headers)
    loans = my_loans_res.json()
    loan_id = loans[0]["id"]

    return_res = client.post(f"/api/v1/loans/return/{loan_id}", headers=member_headers)
    assert return_res.status_code == 200
    returned_loan = return_res.json()
    assert returned_loan["status"] == "RETURNED"


def test_delete_book_with_active_loan_fails(client, member_headers, librarian_headers):
    # Member borrows a book
    list_res = client.get("/api/v1/books")
    book = list_res.json()["items"][1]

    checkout_res = client.post(
        "/api/v1/loans/checkout",
        json={"book_id": book["id"]},
        headers=member_headers,
    )
    assert checkout_res.status_code == 201

    # Librarian attempts to delete this book
    delete_res = client.delete(f"/api/v1/books/{book['id']}", headers=librarian_headers)
    assert delete_res.status_code == 409
