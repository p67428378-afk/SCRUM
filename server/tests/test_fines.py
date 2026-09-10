from datetime import datetime, timedelta, timezone
from server.services.fine_calculator import calculate_overdue_fine
from server.models import Loan


def test_fine_calculator_unit():
    now = datetime.now(timezone.utc)

    # Not overdue
    assert (
        calculate_overdue_fine(due_date=now + timedelta(days=2), return_date=now) == 0.0
    )
    assert calculate_overdue_fine(due_date=now, return_date=now) == 0.0

    # 4 days overdue -> 4 * 0.50 = 2.00
    assert (
        calculate_overdue_fine(due_date=now - timedelta(days=4), return_date=now)
        == 2.00
    )

    # 10 days overdue -> 10 * 0.50 = 5.00
    assert (
        calculate_overdue_fine(due_date=now - timedelta(days=10), return_date=now)
        == 5.00
    )

    # 60 days overdue -> 60 * 0.50 = 30.00 -> capped at 25.00
    assert (
        calculate_overdue_fine(due_date=now - timedelta(days=60), return_date=now)
        == 25.00
    )


def test_overdue_return_and_fine_payment(
    client, staff_headers, admin_headers, db_session
):
    members = client.get("/api/v1/members", headers=staff_headers).json()
    member_id = members[0]["id"]

    books = client.get("/api/v1/books").json()
    book_id = books[0]["id"]

    # Checkout
    checkout_res = client.post(
        "/api/v1/loans/checkout",
        json={"member_id": member_id, "book_id": book_id},
        headers=staff_headers,
    )
    loan_id = checkout_res.json()["id"]

    # Simulate overdue by backdating due_date in DB directly
    db_loan = db_session.query(Loan).filter(Loan.id == loan_id).first()
    db_loan.due_date = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(
        days=10
    )  # 10 days overdue => $5.00 fine
    db_session.commit()

    # Return book
    return_res = client.post(f"/api/v1/loans/{loan_id}/return", headers=staff_headers)
    assert return_res.status_code == 200
    ret_data = return_res.json()
    assert ret_data["fine_amount"] == 5.00

    # Member fine balance
    fines_res = client.get(f"/api/v1/fines/members/{member_id}", headers=staff_headers)
    assert fines_res.status_code == 200
    assert fines_res.json()["unpaid_fines"] >= 5.00

    # Pay fine
    pay_res = client.post(
        f"/api/v1/fines/{loan_id}/pay",
        json={"amount_paid": 5.00},
        headers=staff_headers,
    )
    assert pay_res.status_code == 200
    assert pay_res.json()["amount_paid"] == 5.00


def test_fine_suspension_and_reactivation_on_payment(
    client, staff_headers, admin_headers, db_session
):
    members = client.get("/api/v1/members", headers=staff_headers).json()
    member_id = members[0]["id"]

    books = client.get("/api/v1/books").json()
    book_id = books[0]["id"]

    # Checkout
    checkout_res = client.post(
        "/api/v1/loans/checkout",
        json={"member_id": member_id, "book_id": book_id},
        headers=staff_headers,
    )
    loan_id = checkout_res.json()["id"]

    # Simulate 50 days overdue => $25.00 fine (exceeds $20.00 suspension threshold)
    db_loan = db_session.query(Loan).filter(Loan.id == loan_id).first()
    db_loan.due_date = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(
        days=50
    )
    db_session.commit()

    # Return
    return_res = client.post(f"/api/v1/loans/{loan_id}/return", headers=staff_headers)
    assert return_res.status_code == 200
    assert return_res.json()["fine_amount"] == 25.00

    # Check member is now suspended
    member_check = client.get(
        f"/api/v1/members/{member_id}", headers=staff_headers
    ).json()
    assert member_check["status"] == "SUSPENDED"
    assert member_check["unpaid_fines"] >= 25.00

    # Pay fine down below threshold
    pay_res = client.post(
        f"/api/v1/fines/{member_id}/pay",
        json={"amount_paid": 25.00},
        headers=staff_headers,
    )
    assert pay_res.status_code == 200
    assert pay_res.json()["member_status"] == "ACTIVE"


def test_recalculate_overdue_fines_task(client):
    res = client.post("/api/v1/tasks/recalculate-overdue-fines")
    assert res.status_code == 200
    assert "Recalculation complete" in res.json()["message"]
