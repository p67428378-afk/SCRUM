# Customer Transactions ETL Pipeline (`customer_transactions_etl`)

A production daily batch ETL data pipeline implementing the decoupled staging pattern (GCS -> Parquet Staging -> BigQuery MERGE).

---

## 1. Pipeline Overview

- **Pipeline Name**: `customer_transactions_etl`
- **Schedule**: Daily at `05:30 UTC` (`30 5 * * *`)
- **Source Connector**: Google Cloud Storage (`gs://sdlc-etl-transactions-477110/daily/{{ ds }}/`)
  - Format: CSV (with headers)
  - Mode: Incremental (`{{ ds }}`)
- **Intermediate Staging**: Google Cloud Storage (`gs://sdlc-etl-transactions-477110/staging/customer_transactions/{{ ds }}/`)
  - Format: Parquet
- **Transformations**:
  - Deduplication on `transaction_id` (retaining record with latest `transaction_timestamp`)
  - Currency normalization to USD base: `usd_amount = original_amount * exchange_rate`
  - String cleansing: whitespace stripping and NULL elimination on `customer_id` and `transaction_id`
  - Metadata tracking: `cleansed_at` (UTC timestamp)
- **Target Sink**: Google BigQuery (`analytics.customer_transactions`)
  - Write Mode: `MERGE` (UPSERT on `transaction_id`)
  - Partitioning: `transaction_date` (DAY)
  - Clustering: `customer_id`, `currency`
- **Data Quality Gates**:
  - NULL checks on `transaction_id` and `customer_id`
  - Uniqueness assertions on primary key `transaction_id`
  - Row count threshold assertion (`> 0`)

---

## 2. Directory Layout

```
.
├── dags/
│   └── customer_transactions_etl_dag.py      # Airflow DAG definition
├── pipeline/
│   ├── __init__.py
│   ├── run_customer_transactions_etl.py      # Standalone pipeline runner
│   └── transformations.py                   # Reusable ETL transformations & assertions
├── schemas/
│   └── customer_transactions_schema.json     # BigQuery JSON table schema
├── sql/
│   └── ddl/
│       └── customer_transactions.sql         # BigQuery table DDL DML definition
├── tests/
│   ├── __init__.py
│   ├── test_dag_integrity.py                 # Airflow DAG structure & AST tests
│   ├── test_transformations.py               # Transformation logic & DQ unit tests
│   ├── test_schema_validation.py             # BigQuery schema & DDL validation tests
│   └── test_customer_transactions_etl_pipeline.py # End-to-end runner tests
├── requirements.txt
└── README.md
```

---

## 3. Running Locally & Testing

### Running Tests
```bash
pytest tests/ -v
```

### Executing Standalone Pipeline Runner
```bash
python pipeline/run_customer_transactions_etl.py --date 2025-05-18 --dry-run
```
