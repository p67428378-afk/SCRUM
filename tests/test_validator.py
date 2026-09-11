"""Unit tests for validator and filtering engine."""
from datetime import date, datetime
from server.validator import validate_and_filter_records


def test_validator_clean_records():
    raw_data = [
        {
            "order_id": "ord-1",
            "customer_email": "user1@example.com",
            "amount": 100.50,
            "order_date": date(2026, 5, 18),
            "created_at": datetime.utcnow()
        },
        {
            "order_id": "ord-2",
            "customer_email": "jane.doe@sub.company.org",
            "amount": "250.00",
            "order_date": date(2026, 5, 18),
            "created_at": datetime.utcnow()
        }
    ]

    valid, rejected, breakdown = validate_and_filter_records(raw_data)
    assert len(valid) == 2
    assert len(rejected) == 0
    assert breakdown.missing_or_invalid_amount == 0
    assert breakdown.invalid_email_rfc5322 == 0
    assert valid[0]["amount"] == 100.50
    assert valid[1]["amount"] == 250.00


def test_validator_missing_or_invalid_amount():
    raw_data = [
        {
            "order_id": "ord-1",
            "customer_email": "valid@example.com",
            "amount": None,
            "order_date": date(2026, 5, 18),
            "created_at": datetime.utcnow()
        },
        {
            "order_id": "ord-2",
            "customer_email": "valid@example.com",
            "amount": "invalid_number",
            "order_date": date(2026, 5, 18),
            "created_at": datetime.utcnow()
        }
    ]

    valid, rejected, breakdown = validate_and_filter_records(raw_data)
    assert len(valid) == 0
    assert len(rejected) == 2
    assert breakdown.missing_or_invalid_amount == 2
    assert breakdown.invalid_email_rfc5322 == 0


def test_validator_invalid_email_rfc5322():
    raw_data = [
        {
            "order_id": "ord-1",
            "customer_email": "invalid-email-address",
            "amount": 50.0,
            "order_date": date(2026, 5, 18),
            "created_at": datetime.utcnow()
        },
        {
            "order_id": "ord-2",
            "customer_email": None,
            "amount": 75.0,
            "order_date": date(2026, 5, 18),
            "created_at": datetime.utcnow()
        },
        {
            "order_id": "ord-3",
            "customer_email": "@domain.com",
            "amount": 90.0,
            "order_date": date(2026, 5, 18),
            "created_at": datetime.utcnow()
        }
    ]

    valid, rejected, breakdown = validate_and_filter_records(raw_data)
    assert len(valid) == 0
    assert len(rejected) == 3
    assert breakdown.invalid_email_rfc5322 == 3
