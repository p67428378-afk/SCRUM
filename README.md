# Customer Transactions Batch ETL Pipeline (SCRUM-268)

## Overview
This repository contains the Apache Airflow DAG and BigQuery SQL transformation assets for ingesting, validating, deduplicating, and normalizing daily customer transactions from Google Cloud Storage into Google BigQuery.

## Pipeline Architecture
- **Source**: Google Cloud Storage (`gs://sdlc-etl-transactions-477110/daily/`)
- **Staging Table**: `analytics.stg_customer_transactions`
- **Target Table**: `analytics.customer_transactions` (Partitioned by `transaction_date`, clustered by `customer_id`, `transaction_id`)
- **Quarantine Table**: `analytics.customer_transactions_quarantine` (Partitioned by `quarantine_date`)
- **FX Rates Table**: `analytics.currency_conversion_rates`
- **Schedule**: Daily at `05:30 UTC` (`30 5 * * *`)

## Directory Layout
```
├── dags/
│   ├── customer_transactions_etl.py
│   └── sql/
│       ├── dq_quarantine_validation.sql
│       └── transform_dedup_normalize.sql
├── sql/
│   └── ddl/
│       └── create_tables.sql
├── schemas/
│   └── customer_transactions_schema.json
├── tests/
│   ├── test_customer_transactions_dag.py
│   └── test_sql_transformations.py
├── requirements.txt
└── README.md
```

## Running Tests Locally
```bash
pip install -r requirements.txt
pytest tests/
```
