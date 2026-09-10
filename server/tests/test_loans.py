def test_checkout_and_return_lifecycle(client, staff_headers, patron_headers):
    # 1. Get member ID and Book ID
    members = client.get("/api/v1/members", headers=staff_headers).json()
    member_id = members[0]["id"]

    books = client.get("/api/v1/books").json()
    book = next(b for b in books if b["available_copies"] > 0)
    book_id = book["id"]
    initial_available = book["available_copies"]

    # 2. Checkout book
    checkout_res = client.post(
        "/api/v1/loans/checkout",
        json={"member_id": member_id, "book_id": book_id},
        headers=staff_headers,
    )
    assert checkout_res.status_code == 201
    loan_data = checkout_res.json()
    assert loan_data["status"] == "BORROWED"
    assert loan_data["fine_amount"] == 0.0
    loan_id = loan_data["id"]

    # Check stock decreased
    book_after_checkout = client.get(f"/api/v1/books/{book_id}").json()
    assert book_after_checkout["available_copies"] == initial_available - 1

    # 3. Renew loan
    renew_res = client.post(f"/api/v1/loans/{loan_id}/renew", headers=patron_headers)
    assert renew_res.status_code == 200

    # 4. Return book
    return_res = client.post(f"/api/v1/loans/{loan_id}/return", headers=staff_headers)
    assert return_res.status_code == 200
    returned_data = return_res.json()
    assert returned_data["status"] == "RETURNED"

    # Check stock restored
    book_after_return = client.get(f"/api/v1/books/{book_id}").json()
    assert book_after_return["available_copies"] == initial_available


def test_checkout_blocked_when_no_stock(client, staff_headers, admin_headers):
    # Create a book with 0 total copies
    b_res = client.post(
        "/api/v1/books",
        json={
            "isbn": "978-9999999999",
            "title": "Zero Stock Book",
            "author": "Ghost",
            "category": "Mystery",
            "total_copies": 0,
        },
        headers=admin_headers,
    )
    book_id = b_res.json()["id"]

    members = client.get("/api/v1/members", headers=staff_headers).json()
    member_id = members[0]["id"]

    checkout_res = client.post(
        "/api/v1/loans/checkout",
        json={"member_id": member_id, "book_id": book_id},
        headers=staff_headers,
    )
    assert checkout_res.status_code == 400
    assert "No available copies" in checkout_res.json()["detail"]


def test_checkout_blocked_when_suspended(client, staff_headers, admin_headers):
    members = client.get("/api/v1/members", headers=staff_headers).json()
    member_id = members[0]["id"]

    # Suspend member
    client.put(
        f"/api/v1/members/{member_id}",
        json={"status": "SUSPENDED"},
        headers=admin_headers,
    )

    books = client.get("/api/v1/books").json()
    book_id = books[0]["id"]

    checkout_res = client.post(
        "/api/v1/loans/checkout",
        json={"member_id": member_id, "book_id": book_id},
        headers=staff_headers,
    )
    assert checkout_res.status_code == 400
    assert "SUSPENDED" in checkout_res.json()["detail"]

    # Restore member
    client.put(
        f"/api/v1/members/{member_id}", json={"status": "ACTIVE"}, headers=admin_headers
    )


def test_patron_my_loans(client, patron_headers):
    response = client.get("/api/v1/loans/my-loans", headers=patron_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
