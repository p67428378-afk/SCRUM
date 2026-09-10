import json
import os
import pytest


def test_schema_structure():
    schema_path = os.path.join(os.path.dirname(__file__), "..", "schemas", "customer_transactions_schema.json")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    field_names = [col["name"] for col in schema]
    expected_fields = [
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
    ]
    for field in expected_fields:
        assert field in field_names, f"Expected field '{field}' missing from schema."


def test_sql_transformation_contains_dedup_and_currency():
    sql_path = os.path.join(os.path.dirname(__file__), "..", "dags", "sql", "transform_dedup_normalize.sql")
    with open(sql_path, "r", encoding="utf-8") as f:
        sql = f.read()

    assert "ROW_NUMBER() OVER" in sql
    assert "PARTITION BY transaction_id" in sql
    assert "usd_conversion_rate" in sql
    assert "analytics.customer_transactions" in sql
