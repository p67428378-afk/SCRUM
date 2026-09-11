"""Comprehensive test suite for the Retail Orders ETL Pipeline."""

from datetime import date
from decimal import Decimal
import json
import os
import pytest
from unittest.mock import MagicMock, patch

from pipeline.currency import CurrencyNormalizer, DEFAULT_EXCHANGE_RATES
from pipeline.cleaner import (
    RetailOrderCleaner,
    parse_date_str,
    parse_timestamp_str,
)
from pipeline.loader import BigQueryLoader, QuarantineWriter
from pipeline.run_retail_orders_etl import (
    RetailOrdersETLPipeline,
    read_csv_data,
    get_sample_order_data,
)
from fastapi.testclient import TestClient
from app import app, APP_STATE, execute_etl_task


# =====================================================================
# 1. CURRENCY NORMALIZATION TESTS
# =====================================================================

def test_currency_normalizer_usd():
    """USD amount should have rate 1.0 and identical amount."""
    normalizer = CurrencyNormalizer()
    amount_usd, rate_used = normalizer.convert_to_usd(100.0, "USD")
    assert amount_usd == Decimal("100.00")
    assert rate_used == Decimal("1.0000")


def test_currency_normalizer_eur():
    """EUR amount should be multiplied by EUR exchange rate."""
    normalizer = CurrencyNormalizer()
    eur_rate = DEFAULT_EXCHANGE_RATES["EUR"]
    amount_usd, rate_used = normalizer.convert_to_usd(100.0, "EUR")
    assert rate_used == eur_rate.quantize(Decimal("0.0001"))
    expected_usd = (Decimal("100.0") * eur_rate).quantize(Decimal("0.01"))
    assert amount_usd == expected_usd


def test_currency_normalizer_jpy():
    """JPY amount conversion."""
    normalizer = CurrencyNormalizer()
    amount_usd, rate_used = normalizer.convert_to_usd(10000, "JPY")
    assert rate_used == Decimal("0.0067")
    assert amount_usd == Decimal("67.00")


def test_currency_normalizer_custom_and_date_specific():
    """Test custom rate override and date-specific rate lookup."""
    normalizer = CurrencyNormalizer(
        custom_rates={"EUR": 1.15},
        date_specific_rates={"2026-09-11": {"EUR": 1.20}},
    )
    # Date specific
    amount_usd, rate_used = normalizer.convert_to_usd(100, "EUR", rate_date="2026-09-11")
    assert rate_used == Decimal("1.2000")
    assert amount_usd == Decimal("120.00")

    # Generic date uses custom rate
    amount_usd2, rate_used2 = normalizer.convert_to_usd(100, "EUR", rate_date="2026-09-12")
    assert rate_used2 == Decimal("1.1500")
    assert amount_usd2 == Decimal("115.00")


def test_currency_normalizer_unknown_fallback():
    """Unknown currency should log warning and default to 1.0."""
    normalizer = CurrencyNormalizer()
    amount_usd, rate_used = normalizer.convert_to_usd(50.0, "XYZ")
    assert rate_used == Decimal("1.0000")
    assert amount_usd == Decimal("50.00")


def test_currency_normalizer_invalid_amount():
    """Invalid amount string should raise ValueError."""
    normalizer = CurrencyNormalizer()
    with pytest.raises(ValueError):
        normalizer.convert_to_usd("not_a_number", "USD")


# =====================================================================
# 2. DATE AND TIMESTAMP PARSING TESTS
# =====================================================================

def test_parse_date_str():
    assert parse_date_str("2026-09-11") == "2026-09-11"
    assert parse_date_str("2026/09/11") == "2026-09-11"
    assert parse_date_str("11-09-2026") == "2026-09-11"
    assert parse_date_str("2026-09-11T14:30:00Z") == "2026-09-11"
    assert parse_date_str(None) is None
    assert parse_date_str("invalid_date") is None


def test_parse_timestamp_str():
    ts = parse_timestamp_str("2026-09-11T14:30:00Z")
    assert ts == "2026-09-11T14:30:00Z"
    ts_space = parse_timestamp_str("2026-09-11 14:30:00")
    assert ts_space == "2026-09-11T14:30:00Z"
    assert parse_timestamp_str("not_a_timestamp") is None


# =====================================================================
# 3. CLEANER & DEDUPLICATION & QUARANTINE TESTS
# =====================================================================

def test_cleaner_valid_record():
    cleaner = RetailOrderCleaner()
    row = {
        "order_id": "ORD-101",
        "customer_id": "CUST-01",
        "order_date": "2026-09-11",
        "order_timestamp": "2026-09-11T10:00:00Z",
        "original_amount": "150.00",
        "original_currency": "USD",
        "item_count": "2",
        "status": "COMPLETED",
    }
    cleaned, quarantined = cleaner.validate_and_clean_record(row, "test.csv")
    assert quarantined is None
    assert cleaned is not None
    assert cleaned["order_id"] == "ORD-101"
    assert cleaned["customer_id"] == "CUST-01"
    assert cleaned["amount_usd"] == 150.00
    assert cleaned["exchange_rate_used"] == 1.0
    assert cleaned["item_count"] == 2
    assert cleaned["status"] == "COMPLETED"


def test_cleaner_missing_order_id_quarantined():
    cleaner = RetailOrderCleaner()
    row = {
        "order_id": "",
        "customer_id": "CUST-01",
        "order_date": "2026-09-11",
        "original_amount": "50.00",
    }
    cleaned, quarantined = cleaner.validate_and_clean_record(row, "test.csv")
    assert cleaned is None
    assert quarantined is not None
    assert "Missing or empty mandatory field: order_id" in quarantined["failure_reason"]


def test_cleaner_missing_customer_id_quarantined():
    cleaner = RetailOrderCleaner()
    row = {
        "order_id": "ORD-102",
        "customer_id": "",
        "order_date": "2026-09-11",
        "original_amount": "50.00",
    }
    cleaned, quarantined = cleaner.validate_and_clean_record(row, "test.csv")
    assert cleaned is None
    assert quarantined is not None
    assert "Missing or empty mandatory field: customer_id" in quarantined["failure_reason"]


def test_cleaner_invalid_date_quarantined():
    cleaner = RetailOrderCleaner()
    row = {
        "order_id": "ORD-103",
        "customer_id": "CUST-02",
        "order_date": "NOT_A_DATE",
        "original_amount": "50.00",
    }
    cleaned, quarantined = cleaner.validate_and_clean_record(row, "test.csv")
    assert cleaned is None
    assert quarantined is not None
    assert "Invalid or unparseable order_date" in quarantined["failure_reason"]


def test_cleaner_negative_amount_quarantined():
    cleaner = RetailOrderCleaner()
    row = {
        "order_id": "ORD-104",
        "customer_id": "CUST-03",
        "order_date": "2026-09-11",
        "original_amount": "-25.50",
    }
    cleaned, quarantined = cleaner.validate_and_clean_record(row, "test.csv")
    assert cleaned is None
    assert quarantined is not None
    assert "Negative transaction amount not allowed" in quarantined["failure_reason"]


def test_cleaner_batch_deduplication_keeps_latest():
    """Batch processing should deduplicate by order_id keeping the latest timestamp."""
    cleaner = RetailOrderCleaner()
    records = [
        {
            "order_id": "ORD-DUP-1",
            "customer_id": "CUST-A",
            "order_date": "2026-09-11",
            "order_timestamp": "2026-09-11T08:00:00Z",
            "original_amount": "50.00",
            "original_currency": "USD",
        },
        {
            "order_id": "ORD-DUP-1",
            "customer_id": "CUST-A",
            "order_date": "2026-09-11",
            "order_timestamp": "2026-09-11T12:00:00Z",  # newer
            "original_amount": "75.00",
            "original_currency": "USD",
        },
        {
            "order_id": "ORD-VALID-2",
            "customer_id": "CUST-B",
            "order_date": "2026-09-11",
            "order_timestamp": "2026-09-11T09:00:00Z",
            "original_amount": "100.00",
            "original_currency": "EUR",
        },
        {
            "order_id": "",  # quarantined
            "customer_id": "CUST-C",
            "order_date": "2026-09-11",
            "original_amount": "10.00",
        },
    ]

    valid_recs, quarantined_recs, raw_valid_count = cleaner.process_batch(records, "batch.csv")

    assert raw_valid_count == 3
    assert len(valid_recs) == 2  # ORD-DUP-1 (deduplicated) + ORD-VALID-2
    assert len(quarantined_recs) == 1

    # Verify ORD-DUP-1 took the newer amount (75.00) and newer timestamp
    dup_rec = next(r for r in valid_recs if r["order_id"] == "ORD-DUP-1")
    assert dup_rec["original_amount"] == 75.00
    assert dup_rec["order_timestamp"] == "2026-09-11T12:00:00Z"


# =====================================================================
# 4. BIGQUERY LOADER & AUDIT LOGGING TESTS
# =====================================================================

def test_loader_audit_log_generation():
    loader = BigQueryLoader(project_id="test-proj")
    audit = loader.write_audit_log(
        job_id="test-job-uuid",
        execution_date="2026-09-11",
        ingested_count=100,
        cleaned_count=95,
        deduplicated_count=90,
        quarantined_count=5,
        loaded_count=90,
        status="PARTIAL_SUCCESS",
    )
    assert audit["job_id"] == "test-job-uuid"
    assert audit["execution_date"] == "2026-09-11"
    assert audit["ingested_count"] == 100
    assert audit["quarantined_count"] == 5
    assert audit["status"] == "PARTIAL_SUCCESS"
    assert "completed_at" in audit


def test_quarantine_writer_local(tmp_path):
    writer = QuarantineWriter(local_fallback_dir=str(tmp_path), force_local=True)
    records = [{"failure_reason": "bad id", "raw_record": "{}"}]
    filepath = writer.write_quarantine_records(records, execution_date="2026-09-11")
    assert os.path.exists(filepath)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    assert "bad id" in content


# =====================================================================
# 5. END-TO-END PIPELINE TESTS
# =====================================================================

def test_pipeline_end_to_end_sample_data(tmp_path):
    pipeline = RetailOrdersETLPipeline(force_local_quarantine=True)
    pipeline.quarantine_writer.local_fallback_dir = str(tmp_path)

    sample_csv = get_sample_order_data()
    raw_files = [("daily/test_orders.csv", sample_csv)]

    res = pipeline.run(raw_files=raw_files, execution_date="2026-09-11")

    assert res["status"] in ["SUCCESS", "PARTIAL_SUCCESS"]
    assert res["ingested_count"] == 9
    assert res["quarantined_count"] == 3  # BAD-ROW-1, BAD-ROW-2, BAD-ROW-3
    assert res["cleaned_count"] == 6      # ORD-1001, ORD-1002 (x2), ORD-1003, ORD-1004, ORD-1005
    assert res["deduplicated_count"] == 5 # ORD-1002 deduplicated to 1
    assert res["loaded_count"] == 5


# =====================================================================
# 6. FASTAPI APPLICATION / CLOUD RUN HOOK TESTS
# =====================================================================

client = TestClient(app)


def test_app_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "timestamp" in data


def test_app_status_endpoint():
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "is_running" in data


def test_app_trigger_endpoint_synchronous(monkeypatch):
    monkeypatch.setenv("ETL_OFFLINE_MODE", "true")
    response = client.post("/api/v1/trigger", json={"execution_date": "2026-09-11", "force_sync": True})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert "result" in data
    assert data["result"]["status"] in ["SUCCESS", "PARTIAL_SUCCESS"], f"Returned result: {data['result']}"
    assert data["result"]["deduplicated_count"] >= 1


def test_app_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Retail Orders ETL Service"
    assert data["version"] == "1.0.0"
