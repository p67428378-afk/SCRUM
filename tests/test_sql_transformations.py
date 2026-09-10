"""Unit tests for SQL transformation files, DDL schema, and deduplication/FX logic."""
import os
import sqlite3
import pytest


def test_sql_files_exist():
    """Verify all required SQL transformation and DDL files exist."""
    required_files = [
        "sql/create_tables.sql",
        "sql/dq_quarantine_check.sql",
        "sql/transform_transactions.sql",
    ]
    for rel_path in required_files:
        assert os.path.exists(rel_path), f"Missing SQL file: {rel_path}"
        with open(rel_path, "r", encoding="utf-8") as f:
            content = f.read()
            assert len(content.strip()) > 0, f"SQL file is empty: {rel_path}"


def test_ddl_specifications():
    """Verify create_tables.sql has partitioning, clustering, and required column definitions."""
    with open("sql/create_tables.sql", "r", encoding="utf-8") as f:
        ddl = f.read()

    assert "PARTITION BY transaction_date" in ddl
    assert "CLUSTER BY customer_id, transaction_id" in ddl
    assert "analytics_staging.stg_customer_transactions" in ddl
    assert "analytics_staging.quarantine_transactions" in ddl
    assert "analytics.currency_exchange_rates" in ddl
    assert "analytics.customer_transactions" in ddl


def test_quarantine_sql_rules():
    """Verify dq_quarantine_check.sql checks for mandatory quality criteria."""
    with open("sql/dq_quarantine_check.sql", "r", encoding="utf-8") as f:
        sql = f.read()

    assert "transaction_id IS NULL" in sql
    assert "customer_id IS NULL" in sql
    assert "amount IS NULL" in sql
    assert "transaction_timestamp IS NULL" in sql
    assert "quarantine_reason" in sql


def test_transform_sql_logic():
    """Verify transform_transactions.sql includes window function deduplication and FX conversion."""
    with open("sql/transform_transactions.sql", "r", encoding="utf-8") as f:
        sql = f.read()

    assert "ROW_NUMBER() OVER" in sql
    assert "PARTITION BY" in sql
    assert "ORDER BY" in sql
    assert "analytics.currency_exchange_rates" in sql
    assert "MERGE `analytics.customer_transactions`" in sql
    assert "exchange_rate_usd" in sql
    assert "amount_usd" in sql


def test_sqlite_deduplication_and_currency_normalization():
    """Simulate deduplication and FX normalization logic using SQLite in-memory."""
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()

    # Create staging table
    cursor.execute("""
        CREATE TABLE stg_customer_transactions (
            transaction_id TEXT,
            customer_id TEXT,
            amount REAL,
            currency TEXT,
            transaction_timestamp TEXT,
            payment_method TEXT,
            store_id TEXT,
            updated_at TEXT
        );
    """)

    # Create FX reference table
    cursor.execute("""
        CREATE TABLE currency_exchange_rates (
            currency_code TEXT,
            rate_date TEXT,
            rate_to_usd REAL
        );
    """)

    # Insert FX Rates
    cursor.execute("INSERT INTO currency_exchange_rates VALUES ('EUR', '2026-05-18', 1.08)")
    cursor.execute("INSERT INTO currency_exchange_rates VALUES ('GBP', '2026-05-18', 1.25)")
    cursor.execute("INSERT INTO currency_exchange_rates VALUES ('CAD', '2026-05-18', 0.73)")

    # Insert raw transactions including duplicates and updates
    cursor.executemany("""
        INSERT INTO stg_customer_transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, [
        ("TX100", "CUST01", 100.0, "USD", "2026-05-18 10:00:00", "CC", "S1", "2026-05-18 10:00:00"),
        ("TX100", "CUST01", 120.0, "USD", "2026-05-18 10:00:00", "CC", "S1", "2026-05-18 10:05:00"),  # latest version of TX100
        ("TX200", "CUST02", 50.0,  "EUR", "2026-05-18 11:00:00", "DC", "S2", "2026-05-18 11:00:00"),
        ("TX300", "CUST03", 200.0, "GBP", "2026-05-18 12:00:00", "CC", "S1", "2026-05-18 12:00:00"),
        ("TX400", None,     80.0,  "USD", "2026-05-18 13:00:00", "CC", "S3", "2026-05-18 13:00:00"),  # Invalid (NULL customer)
    ])

    # Run transformation query with ROW_NUMBER() and FX conversion
    query = """
    WITH raw_valid AS (
        SELECT
            TRIM(transaction_id) AS transaction_id,
            TRIM(customer_id) AS customer_id,
            amount AS amount_local,
            UPPER(TRIM(currency)) AS currency_local,
            transaction_timestamp,
            DATE(transaction_timestamp) AS transaction_date,
            payment_method,
            store_id,
            COALESCE(updated_at, transaction_timestamp) AS updated_at,
            ROW_NUMBER() OVER (
                PARTITION BY TRIM(transaction_id)
                ORDER BY COALESCE(updated_at, transaction_timestamp) DESC
            ) AS row_num
        FROM stg_customer_transactions
        WHERE transaction_id IS NOT NULL 
          AND TRIM(transaction_id) != ''
          AND customer_id IS NOT NULL 
          AND TRIM(customer_id) != ''
          AND amount IS NOT NULL 
          AND amount > 0
          AND transaction_timestamp IS NOT NULL
          AND currency IS NOT NULL
    ),
    dedup AS (
        SELECT * FROM raw_valid WHERE row_num = 1
    )
    SELECT
        d.transaction_id,
        d.customer_id,
        d.amount_local,
        d.currency_local,
        CASE
            WHEN d.currency_local = 'USD' THEN 1.0
            ELSE COALESCE(fx.rate_to_usd, 1.0)
        END AS exchange_rate_usd,
        ROUND(d.amount_local * CASE
            WHEN d.currency_local = 'USD' THEN 1.0
            ELSE COALESCE(fx.rate_to_usd, 1.0)
        END, 2) AS amount_usd,
        d.transaction_timestamp,
        d.transaction_date,
        d.payment_method,
        d.store_id,
        d.updated_at
    FROM dedup d
    LEFT JOIN currency_exchange_rates fx
        ON d.currency_local = fx.currency_code
        AND d.transaction_date = fx.rate_date
    ORDER BY d.transaction_id;
    """

    cursor.execute(query)
    results = cursor.fetchall()

    # We expect 3 valid deduplicated records: TX100 (updated 120), TX200 (EUR -> 50*1.08 = 54.0), TX300 (GBP -> 200*1.25 = 250.0)
    assert len(results) == 3

    # TX100 verification
    tx100 = results[0]
    assert tx100[0] == "TX100"
    assert tx100[1] == "CUST01"
    assert tx100[2] == 120.0  # Kept the newer updated_at version
    assert tx100[3] == "USD"
    assert tx100[4] == 1.0
    assert tx100[5] == 120.0

    # TX200 EUR verification
    tx200 = results[1]
    assert tx200[0] == "TX200"
    assert tx200[3] == "EUR"
    assert tx200[4] == 1.08
    assert tx200[5] == 54.0

    # TX300 GBP verification
    tx300 = results[2]
    assert tx300[0] == "TX300"
    assert tx300[3] == "GBP"
    assert tx300[4] == 1.25
    assert tx300[5] == 250.0

    conn.close()
