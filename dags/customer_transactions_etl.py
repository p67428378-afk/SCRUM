"""
Customer Transactions ETL DAG
Jira Issue: SCRUM-268
Orchestrates daily ingestion of CSV transaction files from GCS,
executes data quality validation, routes corrupt rows to quarantine,
and transforms/loads cleaned, deduplicated, and currency-normalized
data into BigQuery partitioned table analytics.customer_transactions.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta

from airflow import DAG
from airflow.providers.google.cloud.operators.bigquery import (
    BigQueryInsertJobOperator,
)
from airflow.providers.google.cloud.sensors.gcs import (
    GCSObjectsWithPrefixExistenceSensor,
)
from airflow.providers.google.cloud.transfers.gcs_to_bigquery import (
    GCSToBigQueryOperator,
)

# Configuration Constants
GCP_CONN_ID = "google_cloud_default"
GCS_BUCKET = "sdlc-etl-transactions-477110"
GCS_PREFIX = "daily/"
BQ_DATASET = "analytics"
BQ_TARGET_TABLE = "customer_transactions"
BQ_STAGING_TABLE = "stg_customer_transactions"
BQ_QUARANTINE_TABLE = "customer_transactions_quarantine"
BQ_RATES_TABLE = "currency_conversion_rates"

DAG_DIR = os.path.dirname(os.path.abspath(__file__))
SQL_DIR = os.path.join(DAG_DIR, "sql")

default_args = {
    "owner": "data-engineering",
    "depends_on_past": False,
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
    "execution_timeout": timedelta(minutes=30),
}

with DAG(
    dag_id="customer_transactions_etl",
    default_args=default_args,
    description="Daily batch ETL pipeline for customer transactions from GCS to BigQuery",
    schedule_interval="30 5 * * *",
    start_date=datetime(2026, 1, 1),
    catchup=False,
    template_searchpath=[DAG_DIR, SQL_DIR],
    tags=["etl", "transactions", "bigquery", "finance"],
) as dag:

    # 1. Check GCS bucket for daily CSV files
    check_gcs_files = GCSObjectsWithPrefixExistenceSensor(
        task_id="check_gcs_files",
        bucket=GCS_BUCKET,
        prefix=GCS_PREFIX,
        gcp_conn_id=GCP_CONN_ID,
        mode="poke",
        poke_interval=60,
        timeout=3600,
    )

    # 2. Ensure BigQuery dataset and tables exist
    create_tables_ddl = BigQueryInsertJobOperator(
        task_id="create_tables_ddl",
        gcp_conn_id=GCP_CONN_ID,
        configuration={
            "query": {
                "query": f"""
                CREATE SCHEMA IF NOT EXISTS `{BQ_DATASET}` OPTIONS(location="US");

                CREATE TABLE IF NOT EXISTS `{BQ_DATASET}.{BQ_STAGING_TABLE}` (
                  transaction_id STRING,
                  customer_id STRING,
                  transaction_timestamp STRING,
                  original_amount STRING,
                  original_currency STRING,
                  merchant_category STRING,
                  payment_method STRING,
                  _source_file STRING,
                  _ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
                );

                CREATE TABLE IF NOT EXISTS `{BQ_DATASET}.{BQ_RATES_TABLE}` (
                  currency_code STRING NOT NULL,
                  rate_date DATE NOT NULL,
                  usd_conversion_rate NUMERIC NOT NULL,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
                );

                CREATE TABLE IF NOT EXISTS `{BQ_DATASET}.{BQ_QUARANTINE_TABLE}` (
                  quarantine_id STRING NOT NULL,
                  raw_record_json STRING NOT NULL,
                  transaction_id STRING,
                  error_reason STRING NOT NULL,
                  source_file STRING,
                  quarantined_at TIMESTAMP NOT NULL,
                  quarantine_date DATE NOT NULL
                )
                PARTITION BY quarantine_date;

                CREATE TABLE IF NOT EXISTS `{BQ_DATASET}.{BQ_TARGET_TABLE}` (
                  transaction_id STRING NOT NULL,
                  customer_id STRING NOT NULL,
                  transaction_timestamp TIMESTAMP NOT NULL,
                  transaction_date DATE NOT NULL,
                  original_amount NUMERIC NOT NULL,
                  original_currency STRING NOT NULL,
                  fx_rate_to_usd NUMERIC NOT NULL,
                  amount_usd NUMERIC NOT NULL,
                  merchant_category STRING,
                  payment_method STRING,
                  ingested_at TIMESTAMP NOT NULL
                )
                PARTITION BY transaction_date
                CLUSTER BY customer_id, transaction_id;
                """,
                "useLegacySql": False,
            }
        },
    )

    # 3. Load daily CSV files from GCS into BigQuery Staging
    load_gcs_to_staging = GCSToBigQueryOperator(
        task_id="load_gcs_to_staging",
        gcp_conn_id=GCP_CONN_ID,
        bucket=GCS_BUCKET,
        source_objects=[f"{GCS_PREFIX}*.csv"],
        destination_project_dataset_table=f"{BQ_DATASET}.{BQ_STAGING_TABLE}",
        source_format="CSV",
        skip_leading_rows=1,
        write_disposition="WRITE_TRUNCATE",
        autodetect=False,
        schema_fields=[
            {"name": "transaction_id", "type": "STRING", "mode": "NULLABLE"},
            {"name": "customer_id", "type": "STRING", "mode": "NULLABLE"},
            {"name": "transaction_timestamp", "type": "STRING", "mode": "NULLABLE"},
            {"name": "original_amount", "type": "STRING", "mode": "NULLABLE"},
            {"name": "original_currency", "type": "STRING", "mode": "NULLABLE"},
            {"name": "merchant_category", "type": "STRING", "mode": "NULLABLE"},
            {"name": "payment_method", "type": "STRING", "mode": "NULLABLE"},
            {"name": "_source_file", "type": "STRING", "mode": "NULLABLE"},
        ],
    )

    # 4. Data Quality Validation and Quarantine Routing
    run_dq_and_quarantine = BigQueryInsertJobOperator(
        task_id="run_dq_and_quarantine",
        gcp_conn_id=GCP_CONN_ID,
        configuration={
            "query": {
                "query": "{% include 'dq_quarantine_validation.sql' %}",
                "useLegacySql": False,
            }
        },
    )

    # 5. Transform, Deduplicate, Normalize Currency, and Load to Target Partitioned Table
    transform_and_load_target = BigQueryInsertJobOperator(
        task_id="transform_and_load_target",
        gcp_conn_id=GCP_CONN_ID,
        configuration={
            "query": {
                "query": "{% include 'transform_dedup_normalize.sql' %}",
                "useLegacySql": False,
            }
        },
    )

    # 6. Purge Staging Table
    purge_staging = BigQueryInsertJobOperator(
        task_id="purge_staging",
        gcp_conn_id=GCP_CONN_ID,
        configuration={
            "query": {
                "query": f"TRUNCATE TABLE `{BQ_DATASET}.{BQ_STAGING_TABLE}`;",
                "useLegacySql": False,
            }
        },
    )

    # Task Dependencies
    (
        check_gcs_files
        >> create_tables_ddl
        >> load_gcs_to_staging
        >> run_dq_and_quarantine
        >> transform_and_load_target
        >> purge_staging
    )
