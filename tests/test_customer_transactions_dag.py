import os
import pytest


def test_schema_file_exists():
    schema_path = os.path.join(os.path.dirname(__file__), "..", "schemas", "customer_transactions_schema.json")
    assert os.path.exists(schema_path), f"Schema file not found at {schema_path}"


def test_sql_files_exist():
    dq_path = os.path.join(os.path.dirname(__file__), "..", "dags", "sql", "dq_quarantine_validation.sql")
    transform_path = os.path.join(os.path.dirname(__file__), "..", "dags", "sql", "transform_dedup_normalize.sql")
    ddl_path = os.path.join(os.path.dirname(__file__), "..", "sql", "ddl", "create_tables.sql")

    assert os.path.exists(dq_path), f"DQ SQL file not found at {dq_path}"
    assert os.path.exists(transform_path), f"Transform SQL file not found at {transform_path}"
    assert os.path.exists(ddl_path), f"DDL SQL file not found at {ddl_path}"


def test_dag_file_syntax():
    dag_path = os.path.join(os.path.dirname(__file__), "..", "dags", "customer_transactions_etl.py")
    assert os.path.exists(dag_path), f"DAG file not found at {dag_path}"

    with open(dag_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "customer_transactions_etl" in content
    assert "30 5 * * *" in content
    assert "sdlc-etl-transactions-477110" in content
