"""Schema and DDL structure validation tests."""
import json
import os
import pytest

def test_bigquery_schema_json_exists():
    """Verify customer_transactions_schema.json exists."""
    schema_path = os.path.join("schemas", "customer_transactions_schema.json")
    assert os.path.exists(schema_path), f"Schema file missing at {schema_path}"

def test_bigquery_schema_structure():
    """Verify BigQuery JSON schema contains all required fields and correct modes."""
    schema_path = os.path.join("schemas", "customer_transactions_schema.json")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    assert isinstance(schema, list)
    field_dict = {item["name"]: item for item in schema}

    expected_fields = [
        ("transaction_id", "STRING", "REQUIRED"),
        ("customer_id", "STRING", "REQUIRED"),
        ("transaction_date", "DATE", "REQUIRED"),
        ("transaction_timestamp", "TIMESTAMP", "REQUIRED"),
        ("original_amount", "NUMERIC", "REQUIRED"),
        ("currency", "STRING", "REQUIRED"),
        ("exchange_rate", "NUMERIC", "REQUIRED"),
        ("usd_amount", "NUMERIC", "REQUIRED"),
        ("cleansed_at", "TIMESTAMP", "REQUIRED"),
    ]

    for field_name, field_type, mode in expected_fields:
        assert field_name in field_dict, f"Field '{field_name}' missing from schema."
        assert field_dict[field_name]["type"] == field_type, f"Field '{field_name}' type mismatch."
        assert field_dict[field_name]["mode"] == mode, f"Field '{field_name}' mode mismatch."

def test_bigquery_ddl_sql_exists():
    """Verify DDL SQL file exists and contains partition/clustering specifications."""
    ddl_path = os.path.join("sql", "ddl", "customer_transactions.sql")
    assert os.path.exists(ddl_path), f"DDL file missing at {ddl_path}"

    with open(ddl_path, "r", encoding="utf-8") as f:
        ddl_content = f.read()

    assert "CREATE TABLE IF NOT EXISTS" in ddl_content
    assert "customer_transactions" in ddl_content
    assert "PARTITION BY DATE(`transaction_date`)" in ddl_content or "PARTITION BY transaction_date" in ddl_content or "PARTITION BY DATE(transaction_date)" in ddl_content
    assert "CLUSTER BY" in ddl_content
    assert "customer_id" in ddl_content
    assert "currency" in ddl_content
