"""Unit tests for transaction transformations and data quality validation."""
import pytest
from pipeline.transformations import (
    transform_and_cleanse_transactions,
    validate_transaction_quality,
)

def test_currency_normalization():
    """Verify currency normalization (usd_amount = original_amount * exchange_rate)."""
    data = [
        {
            "transaction_id": "TXN-001",
            "customer_id": "CUST-001",
            "transaction_date": "2025-05-18",
            "transaction_timestamp": "2025-05-18T10:00:00Z",
            "original_amount": 100.0,
            "currency": "EUR",
            "exchange_rate": 1.08,
        },
        {
            "transaction_id": "TXN-002",
            "customer_id": "CUST-002",
            "transaction_date": "2025-05-18",
            "transaction_timestamp": "2025-05-18T10:05:00Z",
            "original_amount": 5000.0,
            "currency": "JPY",
            "exchange_rate": 0.0065,
        },
    ]
    result = transform_and_cleanse_transactions(data)
    assert len(result) == 2
    row1 = next(r for r in result if r["transaction_id"] == "TXN-001")
    row2 = next(r for r in result if r["transaction_id"] == "TXN-002")
    assert row1["usd_amount"] == pytest.approx(108.0)
    assert row2["usd_amount"] == pytest.approx(32.5)

def test_deduplication_keeps_latest_timestamp():
    """Verify deduplication retains the latest timestamp for identical transaction_ids."""
    data = [
        {
            "transaction_id": "TXN-DUP-01",
            "customer_id": "CUST-100",
            "transaction_date": "2025-05-18",
            "transaction_timestamp": "2025-05-18T08:00:00Z",
            "original_amount": 50.0,
            "currency": "USD",
            "exchange_rate": 1.0,
        },
        {
            "transaction_id": "TXN-DUP-01",
            "customer_id": "CUST-100",
            "transaction_date": "2025-05-18",
            "transaction_timestamp": "2025-05-18T09:30:00Z",
            "original_amount": 75.0,  # Updated amount
            "currency": "USD",
            "exchange_rate": 1.0,
        },
    ]
    result = transform_and_cleanse_transactions(data)
    assert len(result) == 1
    assert result[0]["original_amount"] == 75.0
    assert result[0]["usd_amount"] == 75.0

def test_string_cleanse_and_null_removal():
    """Verify whitespace stripping and null record removal."""
    data = [
        {
            "transaction_id": "  TXN-003  ",
            "customer_id": "   CUST-999   ",
            "transaction_date": "2025-05-18",
            "transaction_timestamp": "2025-05-18T10:00:00Z",
            "original_amount": 200.0,
            "currency": "usd",
            "exchange_rate": 1.0,
        },
        {
            "transaction_id": "",
            "customer_id": "CUST-EMPTY",
            "transaction_date": "2025-05-18",
            "transaction_timestamp": "2025-05-18T10:00:00Z",
            "original_amount": 100.0,
            "currency": "USD",
            "exchange_rate": 1.0,
        },
        {
            "transaction_id": "TXN-NONULL",
            "customer_id": None,
            "transaction_date": "2025-05-18",
            "transaction_timestamp": "2025-05-18T10:00:00Z",
            "original_amount": 100.0,
            "currency": "USD",
            "exchange_rate": 1.0,
        },
    ]
    result = transform_and_cleanse_transactions(data)
    assert len(result) == 1
    assert result[0]["transaction_id"] == "TXN-003"
    assert result[0]["customer_id"] == "CUST-999"
    assert result[0]["currency"] == "USD"

def test_data_quality_validation_pass():
    """Verify quality validation passes for clean datasets."""
    data = [
        {
            "transaction_id": "TXN-101",
            "customer_id": "CUST-101",
            "transaction_date": "2025-05-18",
            "transaction_timestamp": "2025-05-18T10:00:00Z",
            "original_amount": 100.0,
            "currency": "USD",
            "exchange_rate": 1.0,
            "usd_amount": 100.0,
        }
    ]
    passed, summary = validate_transaction_quality(data)
    assert passed is True
    assert summary["row_count_check"] is True
    assert summary["null_check_transaction_id"] is True
    assert summary["null_check_customer_id"] is True
    assert summary["uniqueness_check_transaction_id"] is True

def test_data_quality_validation_fail_on_duplicates():
    """Verify quality validation fails when duplicate transaction_ids exist."""
    data = [
        {"transaction_id": "TXN-SAME", "customer_id": "CUST-1", "original_amount": 10},
        {"transaction_id": "TXN-SAME", "customer_id": "CUST-2", "original_amount": 20},
    ]
    passed, summary = validate_transaction_quality(data)
    assert passed is False
    assert summary["uniqueness_check_transaction_id"] is False
    assert len(summary["errors"]) > 0

def test_data_quality_validation_fail_on_empty():
    """Verify quality validation fails for empty dataset."""
    data = []
    passed, summary = validate_transaction_quality(data)
    assert passed is False
    assert summary["row_count_check"] is False
