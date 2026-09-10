"""
Unit tests for SQL transformations and data quality rules.
Jira Issue: SCRUM-268
"""

import json
import os
import re
import pytest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def test_customer_transactions_schema_json():
    schema_path = os.path.join(REPO_ROOT, "schemas", "customer_transactions_schema.json")
    assert os.path.exists(schema_path), "customer_transactions_schema.json must exist"

    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    assert isinstance(schema, list), "Schema should be a list of field dicts"
    field_names = {field["name"] for field in schema}
    required_fields = {
        "transaction_id",
        "customer_id",
        "transaction_timestamp",
        "transaction_date",
        "original_amount",
        "original_currency",
        "fx_rate_to_usd",
        "amount_usd",
        "merchant_category",
        "payment_method",
        "ingested_at",
    }
    assert required_fields.issubset(field_names), f"Missing fields: {required_fields - field_names}"


def test_quarantine_schema_json():
    schema_path = os.path.join(REPO_ROOT, "schemas", "customer_transactions_quarantine_schema.json")
    assert os.path.exists(schema_path), "customer_transactions_quarantine_schema.json must exist"

    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    field_names = {field["name"] for field in schema}
    required_fields = {
        "quarantine_id",
        "raw_record_json",
        "transaction_id",
        "error_reason",
        "source_file",
        "quarantined_at",
        "quarantine_date",
    }
    assert required_fields.issubset(field_names)


def test_ddl_create_tables_sql():
    ddl_path = os.path.join(REPO_ROOT, "sql", "ddl", "create_tables.sql")
    assert os.path.exists(ddl_path), "sql/ddl/create_tables.sql must exist"

    with open(ddl_path, "r", encoding="utf-8") as f:
        ddl_content = f.read()

    assert "CREATE TABLE IF NOT EXISTS `analytics.customer_transactions`" in ddl_content
    assert "PARTITION BY transaction_date" in ddl_content
    assert "CLUSTER BY customer_id, transaction_id" in ddl_content
    assert "CREATE TABLE IF NOT EXISTS `analytics.customer_transactions_quarantine`" in ddl_content
    assert "CREATE TABLE IF NOT EXISTS `analytics.stg_customer_transactions`" in ddl_content
    assert "CREATE TABLE IF NOT EXISTS `analytics.currency_conversion_rates`" in ddl_content


def test_dq_quarantine_sql():
    dq_path = os.path.join(REPO_ROOT, "dags", "sql", "dq_quarantine_validation.sql")
    with open(dq_path, "r", encoding="utf-8") as f:
        dq_sql = f.read()

    # Check that mandatory error reasons are handled
    assert "NULL_TRANSACTION_ID" in dq_sql
    assert "NULL_CUSTOMER_ID" in dq_sql
    assert "NULL_TIMESTAMP" in dq_sql
    assert "INVALID_AMOUNT" in dq_sql
    assert "NULL_CURRENCY" in dq_sql
    assert "customer_transactions_quarantine" in dq_sql


def test_transform_dedup_normalize_sql():
    transform_path = os.path.join(REPO_ROOT, "dags", "sql", "transform_dedup_normalize.sql")
    with open(transform_path, "r", encoding="utf-8") as f:
        transform_sql = f.read()

    # Deduplication checks
    assert "ROW_NUMBER() OVER" in transform_sql
    assert "PARTITION BY transaction_id" in transform_sql
    assert "ORDER BY transaction_timestamp DESC" in transform_sql

    # Currency normalization checks
    assert "fx.usd_conversion_rate" in transform_sql
    assert "ROUND(d.original_amount * COALESCE(fx.usd_conversion_rate, 1.0), 2)" in transform_sql
    assert "MERGE `analytics.customer_transactions`" in transform_sql


def test_deduplication_and_currency_conversion_logic():
    # Simulation of transformation logic in Python to test business requirements
    raw_records = [
        {
            "transaction_id": "TXN_001",
            "customer_id": "CUST_100",
            "transaction_timestamp": "2026-03-30T10:00:00Z",
            "original_amount": 100.0,
            "original_currency": "EUR",
        },
        {
            "transaction_id": "TXN_001",  # Duplicate with later timestamp
            "customer_id": "CUST_100",
            "transaction_timestamp": "2026-03-30T10:05:00Z",
            "original_amount": 100.0,
            "original_currency": "EUR",
        },
        {
            "transaction_id": "TXN_002",
            "customer_id": "CUST_200",
            "transaction_timestamp": "2026-03-30T11:00:00Z",
            "original_amount": 50.0,
            "original_currency": "USD",
        },
    ]

    fx_rates = {
        ("EUR", "2026-03-30"): 1.08,
        ("USD", "2026-03-30"): 1.0,
    }

    # Deduplicate keeping latest timestamp
    deduped = {}
    for r in raw_records:
        tid = r["transaction_id"]
        if tid not in deduped or r["transaction_timestamp"] > deduped[tid]["transaction_timestamp"]:
            deduped[tid] = r

    assert len(deduped) == 2
    assert deduped["TXN_001"]["transaction_timestamp"] == "2026-03-30T10:05:00Z"

    # Currency normalization
    for r in deduped.values():
        date_key = r["transaction_timestamp"][:10]
        rate = fx_rates.get((r["original_currency"], date_key), 1.0)
        amount_usd = round(r["original_amount"] * rate, 2)
        r["fx_rate_to_usd"] = rate
        r["amount_usd"] = amount_usd

    assert deduped["TXN_001"]["amount_usd"] == 108.0
    assert deduped["TXN_002"]["amount_usd"] == 50.0
