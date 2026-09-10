# Customer Transactions Daily Batch ETL Pipeline

**Jira Issue:** SCRUM-268  
**Dataset:** `analytics`  
**Target Table:** `analytics.customer_transactions`  
**Schedule:** Daily at `05:30 UTC` (`30 5 * * *`)  

---

## 1. Overview

This production ETL pipeline ingests daily customer transaction CSV files from Google Cloud Storage (`gs://sdlc-etl-transactions-477110/daily/`), validates record completeness and constraints, isolates invalid records into a BigQuery quarantine table, performs record deduplication using SQL window functions, converts foreign currency amounts to base USD using exchange rates, and loads the standardized records into a partitioned and clustered BigQuery table.

---

## 2. Architecture & Data Flow

```
   GCS Bucket (daily/*.csv)
             │
             ▼
   [Airflow DAG: customer_transactions_etl]
             │
   1. GCS Sensor (check_gcs_files)
   2. Ensure DDL Tables (create_tables_ddl)
   3. Ingest CSV -> analytics.stg_customer_transactions (load_gcs_to_staging)
   4. Validate DQ -> analytics.customer_transactions_quarantine (run_dq_and_quarantine)
   5. Deduplicate & FX Convert -> analytics.customer_transactions (transform_and_load_target)
   6. Purge Staging (purge_staging)
```

---

## 3. Data Warehouse Tables

### 3.1 `analytics.customer_transactions` (Production Target)
- **Partitioning:** `DAY(transaction_date)`
- **Clustering:** `customer_id`, `transaction_id`

| Column | Type | Mode | Description |
| :--- | :--- | :--- | :--- |
| `transaction_id` | STRING | REQUIRED | Unique transaction identifier |
| `customer_id` | STRING | REQUIRED | Unique customer identifier |
| `transaction_timestamp` | TIMESTAMP | REQUIRED | UTC transaction timestamp |
| `transaction_date` | DATE | REQUIRED | Extracted transaction date (partition key) |
| `original_amount` | NUMERIC | REQUIRED | Raw transaction amount in local currency |
| `original_currency` | STRING | REQUIRED | ISO 3-letter currency code (e.g. USD, EUR, GBP) |
| `fx_rate_to_usd` | NUMERIC | REQUIRED | Exchange rate applied to convert to USD |
| `amount_usd` | NUMERIC | REQUIRED | Normalized transaction amount in USD |
| `merchant_category` | STRING | NULLABLE | Business category of merchant |
| `payment_method` | STRING | NULLABLE | Payment method (Card, Wire, etc.) |
| `ingested_at` | TIMESTAMP | REQUIRED | Pipeline execution timestamp |

### 3.2 `analytics.customer_transactions_quarantine` (Dead-Letter / Quarantine)
- **Partitioning:** `DAY(quarantine_date)`

| Column | Type | Mode | Description |
| :--- | :--- | :--- | :--- |
| `quarantine_id` | STRING | REQUIRED | Unique UUID v4 for quarantine record |
| `raw_record_json` | STRING | REQUIRED | Full JSON string of raw staging row |
| `transaction_id` | STRING | NULLABLE | Transaction ID extracted if present |
| `error_reason` | STRING | REQUIRED | Reason for quarantine rejection |
| `source_file` | STRING | NULLABLE | Source GCS file path |
| `quarantined_at` | TIMESTAMP | REQUIRED | Rejection timestamp |
| `quarantine_date` | DATE | REQUIRED | Partition date |

### 3.3 `analytics.currency_conversion_rates` (Reference Rates)
- Stores daily FX conversion rates to USD per currency code.

---

## 4. Data Quality Validation Rules

| Rule | Condition | Action |
| :--- | :--- | :--- |
| **DQ-01** | `transaction_id IS NULL OR TRIM(transaction_id) = ''` | Quarantine as `NULL_TRANSACTION_ID` |
| **DQ-02** | `customer_id IS NULL OR TRIM(customer_id) = ''` | Quarantine as `NULL_CUSTOMER_ID` |
| **DQ-03** | `transaction_timestamp IS NULL` or unparseable | Quarantine as `NULL_TIMESTAMP` |
| **DQ-04** | `original_amount IS NULL OR original_amount <= 0` | Quarantine as `INVALID_AMOUNT` |
| **DQ-05** | `original_currency IS NULL OR TRIM(original_currency) = ''` | Quarantine as `NULL_CURRENCY` |
| **DQ-06** | Duplicate `transaction_id` in batch | Deduplicated via SQL `ROW_NUMBER()` (latest timestamp retained) |

---

## 5. Repository Layout

```
.
├── dags/
│   ├── customer_transactions_etl.py
│   └── sql/
│       ├── dq_quarantine_validation.sql
│       └── transform_dedup_normalize.sql
├── schemas/
│   ├── customer_transactions_schema.json
│   └── customer_transactions_quarantine_schema.json
├── sql/
│   └── ddl/
│       ├── create_tables.sql
│       ├── customer_transactions.sql
│       └── customer_transactions_quarantine.sql
├── tests/
│   ├── __init__.py
│   ├── test_customer_transactions_dag.py
│   └── test_sql_transformations.py
├── requirements.txt
└── README.md
```

---

## 6. Running Tests Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Execute test suite
pytest tests/ -v
```
