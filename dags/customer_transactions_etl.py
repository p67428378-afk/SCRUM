"""Customer Transactions ETL DAG.

Ingests daily CSV transactions from GCS, validates and quarantines invalid records,
normalizes currency, deduplicates transactions, and loads clean records into BigQuery.
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.providers.google.cloud.sensors.gcs import GCSObjectsWithPrefixExistenceSensor
from airflow.providers.google.cloud.transfers.gcs_to_bigquery import GCSToBigQueryOperator
from airflow.providers.google.cloud.operators.bigquery import BigQueryInsertJobOperator

# Pipeline Constants
GCS_BUCKET = "sdlc-etl-transactions-477110"
GCS_PREFIX = "daily/"
BQ_PROJECT = "analytics"
STAGING_TABLE = f"{BQ_PROJECT}.stg_customer_transactions"
TARGET_TABLE = f"{BQ_PROJECT}.customer_transactions"
QUARANTINE_TABLE = f"{BQ_PROJECT}.customer_transactions_quarantine"
FX_RATES_TABLE = f"{BQ_PROJECT}.currency_conversion_rates"

DEFAULT_ARGS = {
    "owner": "data-engineering",
    "depends_on_past": False,
    "email_on_failure": True,
    "email_on_retry": False,
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
    "execution_timeout": timedelta(minutes=30),
}

with DAG(
    dag_id="customer_transactions_etl",
    default_args=DEFAULT_ARGS,
    description="Daily batch ETL pipeline for customer transactions",
    schedule_interval="30 5 * * *",
    start_date=datetime(2025, 1, 1),
    catchup=False,
    max_active_runs=1,
    tags=["etl", "transactions", "bigquery", "gcs"],
    template_searchpath=["/opt/airflow/dags/sql", "dags/sql"],
) as dag:

    # 1. Check for incoming daily CSV files in GCS
    wait_for_gcs_file = GCSObjectsWithPrefixExistenceSensor(
        task_id="wait_for_gcs_file",
        bucket=GCS_BUCKET,
        prefix=GCS_PREFIX,
        mode="poke",
        poke_interval=60,
        timeout=3600,
    )

    # 2. Ensure target dataset and tables exist
    create_bq_tables = BigQueryInsertJobOperator(
        task_id="create_bq_tables",
        configuration={
            "query": {
                "query": """
                CREATE TABLE IF NOT EXISTS `analytics.customer_transactions` (
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

                CREATE TABLE IF NOT EXISTS `analytics.customer_transactions_quarantine` (
                    quarantine_id STRING NOT NULL,
                    raw_record_json STRING,
                    transaction_id STRING,
                    error_reason STRING NOT NULL,
                    source_file STRING,
                    quarantined_at TIMESTAMP NOT NULL,
                    quarantine_date DATE NOT NULL
                )
                PARTITION BY quarantine_date;

                CREATE TABLE IF NOT EXISTS `analytics.stg_customer_transactions` (
                    transaction_id STRING,
                    customer_id STRING,
                    transaction_timestamp TIMESTAMP,
                    original_amount NUMERIC,
                    original_currency STRING,
                    merchant_category STRING,
                    payment_method STRING,
                    source_file STRING,
                    ingested_at TIMESTAMP
                );
                """,
                "useLegacySql": False,
            }
        },
    )

    # 3. Load daily CSV data from GCS into staging table
    load_gcs_to_staging = GCSToBigQueryOperator(
        task_id="load_gcs_to_staging",
        bucket=GCS_BUCKET,
        source_objects=[f"{GCS_PREFIX}*.csv"],
        destination_project_dataset_table=STAGING_TABLE,
        source_format="CSV",
        skip_leading_rows=1,
        write_disposition="WRITE_TRUNCATE",
        autodetect=True,
    )

    # 4. Perform Data Quality checks and route invalid records to quarantine
    run_data_quality_checks = BigQueryInsertJobOperator(
        task_id="run_data_quality_checks",
        configuration={
            "query": {
                "query": "{% include 'dq_quarantine_validation.sql' %}",
                "useLegacySql": False,
            }
        },
    )

    # 5. Transform, deduplicate, normalize currency, and load into production table
    execute_transformations_and_load = BigQueryInsertJobOperator(
        task_id="execute_transformations_and_load",
        configuration={
            "query": {
                "query": "{% include 'transform_dedup_normalize.sql' %}",
                "useLegacySql": False,
            }
        },
    )

    # 6. Purge staging table after successful processing
    purge_staging = BigQueryInsertJobOperator(
        task_id="purge_staging",
        configuration={
            "query": {
                "query": f"TRUNCATE TABLE `{STAGING_TABLE}`;",
                "useLegacySql": False,
            }
        },
    )

    # Task Dependencies
    wait_for_gcs_file >> create_bq_tables >> load_gcs_to_staging >> run_data_quality_checks >> execute_transformations_and_load >> purge_staging
