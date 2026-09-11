"""Unit tests for DataValidator."""
from datetime import date, datetime
import pytest
from server.models import RawSalesOrder
from server.validator import DataValidator


def test_validate_amount_valid():
    is_valid, val = DataValidator.validate_amount(150.75)
    assert is_valid is True
    assert val == 150.75

    is_valid, val = DataValidator.validate_amount("200.50")
    assert is_valid is True
    assert val == 200.50

    is_valid, val = DataValidator.validate_amount(0)
    assert is_valid is True
    assert val == 0.0


def test_validate_amount_invalid():
    is_valid, _ = DataValidator.validate_amount(None)
    assert is_valid is False

    is_valid, _ = DataValidator.validate_amount("abc")
    assert is_valid is False

    is_valid, _ = DataValidator.validate_amount(float("nan"))
    assert is_valid is False


def test_validate_email_valid():
    assert DataValidator.validate_email("user@example.com") is True
    assert DataValidator.validate_email("john.doe+tag@sub.domain.co") is True
    assert DataValidator.validate_email("test_123@domain-name.org") is True


def test_validate_email_invalid():
    assert DataValidator.validate_email(None) is False
    assert DataValidator.validate_email("") is False
    assert DataValidator.validate_email("plainaddress") is False
    assert DataValidator.validate_email("@missingusername.com") is False
    assert DataValidator.validate_email("user@.com") is False
    assert DataValidator.validate_email("user@domain") is False


def test_validate_records():
    now = datetime.utcnow()
    today = date.today()

    records = [
        # Valid
        RawSalesOrder(
            order_id="ord-1",
            customer_email="alice@example.com",
            amount=99.99,
            order_date=today,
            created_at=now,
        ),
        # Missing amount
        RawSalesOrder(
            order_id="ord-2",
            customer_email="bob@example.com",
            amount=None,
            order_date=today,
            created_at=now,
        ),
        # Invalid email
        RawSalesOrder(
            order_id="ord-3",
            customer_email="not-an-email",
            amount=150.0,
            order_date=today,
            created_at=now,
        ),
        # Missing email & amount
        RawSalesOrder(
            order_id="ord-4",
            customer_email=None,
            amount=None,
            order_date=today,
            created_at=now,
        ),
    ]

    valid, breakdown = DataValidator.validate_records(records)
    assert len(valid) == 1
    assert valid[0].order_id == "ord-1"
    assert valid[0].amount == 99.99
    assert valid[0].customer_email == "alice@example.com"

    # ord-2 fails amount, ord-4 fails amount first
    assert breakdown.missing_or_invalid_amount == 2
    # ord-3 fails email
    assert breakdown.invalid_email_rfc5322 == 1
