"""
Module: tests.test_payment
Purpose: Test online dues payment
"""

from datetime import date
from server.app.models.resident import Resident
from server.app.models.payment import Bill


def test_get_bills_success(client, db):
    # AC: Online Dues Payment - Get Bills
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    db.add(res)
    db.commit()

    bill = Bill(
        id="bill-123",
        resident_id="res-123",
        amount=150.00,
        due_date=date(2026, 6, 30),
        status="Unpaid",
        description="Maintenance Fee",
    )
    db.add(bill)
    db.commit()

    response = client.get("/api/v1/bills?resident_id=res-123")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert float(data[0]["amount"]) == 150.00
    assert data[0]["status"] == "Unpaid"
    assert data[0]["description"] == "Maintenance Fee"


def test_make_payment_success(client, db):
    # AC: Online Dues Payment - Make Payment Happy Path
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    db.add(res)
    db.commit()

    bill = Bill(
        id="bill-123",
        resident_id="res-123",
        amount=150.00,
        due_date=date(2026, 6, 30),
        status="Unpaid",
        description="Maintenance Fee",
    )
    db.add(bill)
    db.commit()

    payload = {
        "bill_id": "bill-123",
        "amount_paid": 150.00,
        "payment_method": "card",
        "card_details": {
            "card_number": "1234567890123456",
            "cvv": "123",
            "expiry": "12/28",
        },
    }

    response = client.post("/api/v1/payments", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert float(data["amount_paid"]) == 150.00
    assert data["status"] == "Success"
    assert "transaction_id" in data

    # Verify bill status is updated to Paid
    db.refresh(bill)
    assert bill.status == "Paid"


def test_make_payment_invalid_bill(client, db):
    # AC: Online Dues Payment - Invalid Bill
    payload = {
        "bill_id": "non-existent",
        "amount_paid": 150.00,
        "payment_method": "card",
        "card_details": {
            "card_number": "1234567890123456",
            "cvv": "123",
            "expiry": "12/28",
        },
    }
    response = client.post("/api/v1/payments", json=payload)
    assert response.status_code == 400
    assert "Invalid bill" in response.json()["detail"]


def test_make_payment_missing_card_details(client, db):
    # AC: Online Dues Payment - Missing Card Details
    res = Resident(
        id="res-123",
        name="John Doe",
        apartment_number="101",
        phone_number="1234567890",
        email="john@example.com",
    )
    db.add(res)
    db.commit()

    bill = Bill(
        id="bill-123",
        resident_id="res-123",
        amount=150.00,
        due_date=date(2026, 6, 30),
        status="Unpaid",
        description="Maintenance Fee",
    )
    db.add(bill)
    db.commit()

    payload = {
        "bill_id": "bill-123",
        "amount_paid": 150.00,
        "payment_method": "card",
        "card_details": None,
    }
    response = client.post("/api/v1/payments", json=payload)
    assert response.status_code == 400
    assert "Missing card details" in response.json()["detail"]
