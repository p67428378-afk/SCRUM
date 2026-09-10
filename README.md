# Daily Batch ETL Pipeline for Customer Transactions

Automated daily batch ETL data pipeline orchestrating ingestion, data quality validation, deduplication, currency normalization, and partitioned loading of customer transaction files from Google Cloud Storage into Google BigQuery using Apache Airflow.

---

## 1. Pipeline Architecture & Flow

```
[Google Cloud Storage]
  gs://sdlc-etl-transactions-477110/daily/*.csv
       │
       ▼
[1. GCSObjectsWithPrefixExistenceSensor] (02:00 UTC Daily)
       │
       ▼
[2. GCSToBigQueryOperator] -> analytics_staging.stg_customer_transactions
       │
       ▼
[3. BigQueryInsertJobOperator] -> analytics_staging.quarantine_transactions (Filter invalid/nulls)
       │
       ▼
[4. BigQueryInsertJobOperator] -> Deduplication & FX Conversion -> MERGE into analytics.customer_transactions
       │
       ▼
[5. DataQualityOperator] -> Post-load row count & constraint assertions
```

---

## 2. Directory Structure

```
.
├── dags/
│   └── daily_customer_transactions_etl.py
├── plugins/
│   ├── __init__.py
│   └── operators/
│       ├── __init__.py
│       └── data_quality_operator.py
├── sql/
│   ├── create_tables.sql
│   ├── dq_quarantine_check.sql
│   ├── transform_transactions.sql
│   └── ddl/
│       └── customer_transactions.sql
├── schemas/
│   └── customer_transactions_schema.json
├── tests/
│   ├── __init__.py
│   ├── test_dag_validation.py
│   └── test_sql_transformations.py
├── requirements.txt
└── README.md
```

---

## 3. Data Warehouse Schemas

### Target Table: `analytics.customer_transactions`
- **Partitioning**: Day-partitioned on `transaction_date`
- **Clustering**: `customer_id`, `transaction_id`
- **Fields**:
  - `transaction_id` (STRING, REQUIRED)
  - `customer_id` (STRING, REQUIRED)
  - `amount_local` (NUMERIC, REQUIRED)
  - `currency_local` (STRING, REQUIRED)
  - `exchange_rate_usd` (NUMERIC, REQUIRED)
  - `amount_usd` (NUMERIC, REQUIRED)
  - `transaction_timestamp` (TIMESTAMP, REQUIRED)
  - `transaction_date` (DATE, REQUIRED)
  - `payment_method` (STRING, NULLABLE)
  - `store_id` (STRING, NULLABLE)
  - `updated_at` (TIMESTAMP, REQUIRED)
  - `etl_loaded_at` (TIMESTAMP, REQUIRED)

---

## 4. Local Validation & Testing

Run unit and integration tests using `pytest`:

```bash
pip install -r requirements.txt
pytest tests/ -v
```
