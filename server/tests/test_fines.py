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


def test_fine_payment_flow(client, db_session):
    admin_token = get_admin_token(client)
    patron_token = get_patron_token(client)

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    patron_headers = {"Authorization": f"Bearer {patron_token}"}

    # Checkout and return overdue to generate a fine
    books_resp = client.get("/api/v1/books?status=AVAILABLE")
    book_id = books_resp.json()[0]["id"]

    checkout_resp = client.post(
        "/api/v1/loans/checkout", json={"book_id": book_id}, headers=patron_headers
    )
    loan_id = checkout_resp.json()["id"]

    # Backdate due_date
    loan = db_session.query(Loan).filter(Loan.id == loan_id).first()
    loan.due_date = datetime.utcnow() - timedelta(days=4)
    db_session.commit()

    # Return book (4 days late -> $2.00 fine)
    client.post(f"/api/v1/loans/{loan_id}/return", headers=patron_headers)

    # Librarian list fines
    fines_resp = client.get("/api/v1/fines", headers=admin_headers)
    assert fines_resp.status_code == 200
    fines = fines_resp.json()
    assert len(fines) >= 1
    fine_id = fines[0]["id"]

    # Pay fine
    pay_resp = client.post(f"/api/v1/fines/{fine_id}/pay", headers=patron_headers)
    assert pay_resp.status_code == 200
    pay_data = pay_resp.json()
    assert pay_data["fine"]["status"] == "PAID"
