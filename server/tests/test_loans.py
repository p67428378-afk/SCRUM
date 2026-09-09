from datetime import datetime, timedelta, timezone
from server.models import Book, Loan, User


def test_checkout_and_return_workflow(client, patron_headers, admin_headers):
    # 1. Get a book to checkout
    res_books = client.get("/api/v1/books")
    book = res_books.json()[0]
    initial_avail = book["available_copies"]

    # 2. Patron checkouts the book
    res_checkout = client.post(
        "/api/v1/loans/checkout",
        json={"book_id": book["id"]},
        headers=patron_headers,
    )
    assert res_checkout.status_code == 201
    loan = res_checkout.json()
    assert loan["book_id"] == book["id"]
    assert loan["status"] == "active"
    assert loan["return_date"] is None

    # Verify inventory was decremented
    res_book_after = client.get(f"/api/v1/books/{book['id']}")
    assert res_book_after.json()["available_copies"] == initial_avail - 1

    # 3. Patron renews the loan
    res_renew = client.post(
        f"/api/v1/loans/renew/{loan['id']}",
        headers=patron_headers,
    )
    assert res_renew.status_code == 200
    renewed_loan = res_renew.json()
    # Due date should have increased
    due1 = datetime.fromisoformat(loan["due_date"].replace("Z", "+00:00"))
    due2 = datetime.fromisoformat(renewed_loan["due_date"].replace("Z", "+00:00"))
    assert due2 > due1

    # 4. Patron returns the book
    res_return = client.post(
        f"/api/v1/loans/return/{loan['id']}",
        headers=patron_headers,
    )
    assert res_return.status_code == 200
    returned_loan = res_return.json()
    assert returned_loan["status"] == "returned"
    assert returned_loan["return_date"] is not None

    # Verify inventory was restored
    res_book_restored = client.get(f"/api/v1/books/{book['id']}")
    assert res_book_restored.json()["available_copies"] == initial_avail

    # 5. Cannot return an already returned book
    res_double_return = client.post(
        f"/api/v1/loans/return/{loan['id']}",
        headers=patron_headers,
    )
    assert res_double_return.status_code == 400


def test_checkout_zero_copies_blocked(
    client, db_session, patron_headers, admin_headers
):
    # Create a book with 0 available copies
    res_admin = client.post(
        "/api/v1/books",
        json={
            "title": "Rare Manuscripts",
            "author": "Archivist",
            "isbn": "9781111222333",
            "genre": "Archive",
            "total_copies": 1,
            "available_copies": 0,
        },
        headers=admin_headers,
    )
    assert res_admin.status_code == 201
    zero_book = res_admin.json()

    # Attempt to checkout
    res_checkout = client.post(
        "/api/v1/loans/checkout",
        json={"book_id": zero_book["id"]},
        headers=patron_headers,
    )
    assert res_checkout.status_code == 400
    assert "Book is not available for checkout" in res_checkout.json()["detail"]


def test_overdue_loans_detection(client, db_session, admin_headers, patron_headers):
    # Setup an overdue loan directly in DB
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    book = db_session.query(Book).first()

    now = datetime.now(timezone.utc)
    overdue_loan = Loan(
        id="overdue-loan-uuid-1",
        book_id=book.id,
        patron_id=user.id,
        checkout_date=now - timedelta(days=20),
        due_date=now - timedelta(days=6),
        return_date=None,
        status="active",
        created_at=now - timedelta(days=20),
        updated_at=now - timedelta(days=20),
    )
    db_session.add(overdue_loan)
    db_session.commit()

    # Query overdue loans endpoint (Admin only)
    res_overdue = client.get("/api/v1/loans/overdue", headers=admin_headers)
    assert res_overdue.status_code == 200
    overdue_list = res_overdue.json()
    assert any(l["id"] == "overdue-loan-uuid-1" for l in overdue_list)

    # Attempt to renew overdue loan should fail with 400
    res_renew_overdue = client.post(
        "/api/v1/loans/renew/overdue-loan-uuid-1",
        headers=patron_headers,
    )
    assert res_renew_overdue.status_code == 400
    assert "overdue" in res_renew_overdue.json()["detail"].lower()


def test_patron_loans_history(client, patron_headers):
    # Get current user info
    me = client.get("/api/v1/auth/me", headers=patron_headers).json()

    # Get patron loans
    res_loans = client.get(f"/api/v1/patrons/{me['id']}/loans", headers=patron_headers)
    assert res_loans.status_code == 200
    loans = res_loans.json()
    assert isinstance(loans, list)
