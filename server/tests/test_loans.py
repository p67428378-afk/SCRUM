from datetime import datetime, timedelta
from server.models import Loan


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


def test_checkout_and_return_flow(client, db_session):
    patron_token = get_patron_token(client)
    headers = {"Authorization": f"Bearer {patron_token}"}

    # Find an available book
    books_resp = client.get("/api/v1/books?status=AVAILABLE")
    available_books = books_resp.json()
    assert len(available_books) > 0
    book_id = available_books[0]["id"]

    # Checkout book
    checkout_resp = client.post(
        "/api/v1/loans/checkout", json={"book_id": book_id}, headers=headers
    )
    assert checkout_resp.status_code == 201
    loan_data = checkout_resp.json()
    assert loan_data["status"] == "BORROWED"
    assert loan_data["book_id"] == book_id
    loan_id = loan_data["id"]

    # Verify book status changed to BORROWED
    book_resp = client.get(f"/api/v1/books/{book_id}")
    assert book_resp.json()["status"] == "BORROWED"

    # Attempting to checkout same book again -> 400 Bad Request
    dup_checkout = client.post(
        "/api/v1/loans/checkout", json={"book_id": book_id}, headers=headers
    )
    assert dup_checkout.status_code == 400

    # Get my loans
    my_loans = client.get("/api/v1/loans/my-loans", headers=headers)
    assert my_loans.status_code == 200
    assert any(l["id"] == loan_id for l in my_loans.json())

    # Return book
    return_resp = client.post(f"/api/v1/loans/{loan_id}/return", headers=headers)
    assert return_resp.status_code == 200
    ret_data = return_resp.json()
    assert ret_data["loan"]["status"] == "RETURNED"

    # Verify book status restored to AVAILABLE
    book_resp_after = client.get(f"/api/v1/books/{book_id}")
    assert book_resp_after.json()["status"] == "AVAILABLE"


def test_overdue_fine_calculation(client, db_session):
    patron_token = get_patron_token(client)
    headers = {"Authorization": f"Bearer {patron_token}"}

    # Available book
    books_resp = client.get("/api/v1/books?status=AVAILABLE")
    book_id = books_resp.json()[0]["id"]

    checkout_resp = client.post(
        "/api/v1/loans/checkout", json={"book_id": book_id}, headers=headers
    )
    loan_id = checkout_resp.json()["id"]

    # Manually backdate due_date by 3 days in db_session
    loan = db_session.query(Loan).filter(Loan.id == loan_id).first()
    loan.due_date = datetime.utcnow() - timedelta(days=3)
    db_session.commit()

    # Return book (3 days late -> 3 * 0.50 = $1.50 fine)
    return_resp = client.post(f"/api/v1/loans/{loan_id}/return", headers=headers)
    assert return_resp.status_code == 200
    ret_data = return_resp.json()
    assert ret_data["fine_assessed"] == 1.50
