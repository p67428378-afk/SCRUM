"""Apache Airflow DAG: Daily Batch ETL Data Pipeline for Customer Transactions.

Ingests daily transaction CSV files from Google Cloud Storage, executes data
quality validation and quarantine routing, performs window-based deduplication
and FX normalization, and idempotently loads records into the partitioned BigQuery table.
"""

from datetime import datetime, timedelta
import os
from typing import Any, List, Optional

_current_dag: Optional[Any] = None

try:
    from airflow import DAG
    from airflow.providers.google.cloud.operators.bigquery import BigQueryInsertJobOperator
    from airflow.providers.google.cloud.sensors.gcs import GCSObjectsWithPrefixExistenceSensor
    from airflow.providers.google.cloud.transfers.gcs_to_bigquery import GCSToBigQueryOperator
except ImportError:
    class DAG:  # type: ignore
        def __init__(
            self,
            dag_id: str,
            default_args: Optional[dict] = None,
            schedule_interval: Optional[str] = None,
            schedule: Optional[str] = None,
            start_date: Optional[datetime] = None,
            catchup: bool = False,
            max_active_runs: int = 1,
            description: str = "",
            tags: Optional[List[str]] = None,
            **kwargs: Any,
        ) -> None:
            self.dag_id = dag_id
            self.default_args = default_args or {}
            self.schedule_interval = schedule_interval or schedule
            self.start_date = start_date
            self.catchup = catchup
            self.max_active_runs = max_active_runs
            self.description = description
            self.tags = tags or []
            self.tasks: List[Any] = []

        def __enter__(self) -> "DAG":
            global _current_dag
            _current_dag = self
            return self

        def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
            global _current_dag
            _current_dag = None

        def get_task(self, task_id: str) -> Optional[Any]:
            for t in self.tasks:
                if t.task_id == task_id:
                    return t
            return None

    class _BaseMockOperator:
        def __init__(self, task_id: str, **kwargs: Any) -> None:
            self.task_id = task_id
            self.downstream_list: List[Any] = []
            self.upstream_list: List[Any] = []
            for k, v in kwargs.items():
                setattr(self, k, v)
            if _current_dag is not None and self not in _current_dag.tasks:
                _current_dag.tasks.append(self)

        def __rshift__(self, other: Any) -> Any:
            if other not in self.downstream_list:
                self.downstream_list.append(other)
            if hasattr(other, "upstream_list") and self not in other.upstream_list:
                other.upstream_list.append(self)
            return other

    class BigQueryInsertJobOperator(_BaseMockOperator):  # type: ignore
        pass

    class GCSObjectsWithPrefixExistenceSensor(_BaseMockOperator):  # type: ignore
        pass

    class GCSToBigQueryOperator(_BaseMockOperator):  # type: ignore
        pass


from plugins.operators.data_quality_operator import DataQualityOperator

# Pipeline Constants
GCS_BUCKET = "sdlc-etl-transactions-477110"
GCS_PREFIX = "daily/"
BQ_PROJECT = os.getenv("GCP_PROJECT", "upbeat-repeater-477110-q6")
BQ_STAGING_DATASET = "analytics_staging"
BQ_PROD_DATASET = "analytics"
STAGING_TABLE = f"{BQ_PROJECT}.{BQ_STAGING_DATASET}.stg_customer_transactions"
QUARANTINE_TABLE = f"{BQ_PROJECT}.{BQ_STAGING_DATASET}.quarantine_transactions"
TARGET_TABLE = f"{BQ_PROJECT}.{BQ_PROD_DATASET}.customer_transactions"
FX_TABLE = f"{BQ_PROJECT}.{BQ_PROD_DATASET}.currency_exchange_rates"

DEFAULT_ARGS = {
    "owner": "data_engineering",
    "depends_on_past": False,
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
    "retry_exponential_backoff": True,
}

STAGING_SCHEMA = [
    {"name": "transaction_id", "type": "STRING", "mode": "NULLABLE"},
    {"name": "customer_id", "type": "STRING", "mode": "NULLABLE"},
    {"name": "amount", "type": "FLOAT", "mode": "NULLABLE"},
    {"name": "currency", "type": "STRING", "mode": "NULLABLE"},
    {"name": "transaction_timestamp", "type": "TIMESTAMP", "mode": "NULLABLE"},
    {"name": "payment_method", "type": "STRING", "mode": "NULLABLE"},
    {"name": "store_id", "type": "STRING", "mode": "NULLABLE"},
    {"name": "updated_at", "type": "TIMESTAMP", "mode": "NULLABLE"},
]

QUARANTINE_SQL = f"""
INSERT INTO `{QUARANTINE_TABLE}` (
  transaction_id,
  customer_id,
  amount,
  currency,
  transaction_timestamp,
  payment_method,
  store_id,
  updated_at,
  quarantine_reason,
  quarantined_at
)
SELECT
  transaction_id,
  customer_id,
  amount,
  currency,
  transaction_timestamp,
  payment_method,
  store_id,
  updated_at,
  CASE
    WHEN transaction_id IS NULL OR TRIM(transaction_id) = '' THEN 'NULL_OR_EMPTY_TRANSACTION_ID'
    WHEN customer_id IS NULL OR TRIM(customer_id) = '' THEN 'NULL_OR_EMPTY_CUSTOMER_ID'
    WHEN amount IS NULL THEN 'NULL_AMOUNT'
    WHEN amount <= 0 THEN 'INVALID_AMOUNT_NON_POSITIVE'
    WHEN transaction_timestamp IS NULL THEN 'NULL_TRANSACTION_TIMESTAMP'
    WHEN currency IS NULL OR TRIM(currency) = '' THEN 'NULL_OR_EMPTY_CURRENCY'
    ELSE 'UNKNOWN_DATA_QUALITY_ERROR'
  END AS quarantine_reason,
  CURRENT_TIMESTAMP() AS quarantined_at
FROM `{STAGING_TABLE}`
WHERE transaction_id IS NULL
   OR TRIM(transaction_id) = ''
   OR customer_id IS NULL
   OR TRIM(customer_id) = ''
   OR amount IS NULL
   OR amount <= 0
   OR transaction_timestamp IS NULL
   OR currency IS NULL
   OR TRIM(currency) = '';
"""

TRANSFORM_MERGE_SQL = f"""
MERGE `{TARGET_TABLE}` T
USING (
  WITH raw_valid AS (
    SELECT
      TRIM(transaction_id) AS transaction_id,
      TRIM(customer_id) AS customer_id,
      CAST(amount AS NUMERIC) AS amount_local,
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
    FROM `{STAGING_TABLE}`
    WHERE transaction_id IS NOT NULL 
      AND TRIM(transaction_id) != ''
      AND customer_id IS NOT NULL
      AND TRIM(customer_id) != ''
      AND amount IS NOT NULL
      AND amount > 0
      AND transaction_timestamp IS NOT NULL
      AND currency IS NOT NULL
      AND TRIM(currency) != ''
  ),
  deduplicated AS (
    SELECT * EXCEPT(row_num)
    FROM raw_valid
    WHERE row_num = 1
  ),
  fx_lookup AS (
    SELECT
      d.transaction_id,
      d.customer_id,
      d.amount_local,
      d.currency_local,
      CASE
        WHEN d.currency_local = 'USD' THEN 1.0
        ELSE COALESCE(fx.rate_to_usd, 1.0)
      END AS exchange_rate_usd,
      d.transaction_timestamp,
      d.transaction_date,
      d.payment_method,
      d.store_id,
      d.updated_at
    FROM deduplicated d
    LEFT JOIN `{FX_TABLE}` fx
      ON d.currency_local = fx.currency_code
      AND d.transaction_date = fx.rate_date
  )
  SELECT
    transaction_id,
    customer_id,
    amount_local,
    currency_local,
    CAST(exchange_rate_usd AS NUMERIC) AS exchange_rate_usd,
    CAST(ROUND(amount_local * exchange_rate_usd, 2) AS NUMERIC) AS amount_usd,
    transaction_timestamp,
    transaction_date,
    payment_method,
    store_id,
    updated_at,
    CURRENT_TIMESTAMP() AS etl_loaded_at
  FROM fx_lookup
) S
ON T.transaction_id = S.transaction_id
  AND T.transaction_date = S.transaction_date
WHEN MATCHED AND S.updated_at >= T.updated_at THEN
  UPDATE SET
    customer_id = S.customer_id,
    amount_local = S.amount_local,
    currency_local = S.currency_local,
    exchange_rate_usd = S.exchange_rate_usd,
    amount_usd = S.amount_usd,
    transaction_timestamp = S.transaction_timestamp,
    payment_method = S.payment_method,
    store_id = S.store_id,
    updated_at = S.updated_at,
    etl_loaded_at = S.etl_loaded_at
WHEN NOT MATCHED THEN
  INSERT (
    transaction_id,
    customer_id,
    amount_local,
    currency_local,
    exchange_rate_usd,
    amount_usd,
    transaction_timestamp,
    transaction_date,
    payment_method,
    store_id,
    updated_at,
    etl_loaded_at
  )
  VALUES (
    S.transaction_id,
    S.customer_id,
    S.amount_local,
    S.currency_local,
    S.exchange_rate_usd,
    S.amount_usd,
    S.transaction_timestamp,
    S.transaction_date,
    S.payment_method,
    S.store_id,
    S.updated_at,
    S.etl_loaded_at
  );
"""

with DAG(
    dag_id="daily_customer_transactions_etl",
    default_args=DEFAULT_ARGS,
    description="Daily ETL pipeline ingesting transactions from GCS into partitioned BigQuery table",
    schedule_interval="0 2 * * *",
    start_date=datetime(2026, 1, 1),
    catchup=False,
    max_active_runs=1,
    tags=["etl", "gcs", "bigquery", "transactions", "batch"],
) as dag:

    # Task 1: Check if daily transaction files exist in GCS
    check_gcs_file = GCSObjectsWithPrefixExistenceSensor(
        task_id="check_gcs_file",
        bucket=GCS_BUCKET,
        prefix=GCS_PREFIX,
        mode="reschedule",
        poke_interval=120,
        timeout=600,
        soft_fail=False,
    )

    # Task 2: Ingest raw CSV from GCS to BigQuery Staging
    load_csv_to_staging = GCSToBigQueryOperator(
        task_id="load_csv_to_staging",
        bucket=GCS_BUCKET,
        source_objects=[f"{GCS_PREFIX}*.csv"],
        destination_project_dataset_table=STAGING_TABLE,
        schema_fields=STAGING_SCHEMA,
        write_disposition="WRITE_TRUNCATE",
        source_format="CSV",
        skip_leading_rows=1,
        allow_quoted_newlines=True,
    )

    # Task 3: Quarantine invalid/malformed records
    quarantine_invalid_records = BigQueryInsertJobOperator(
        task_id="quarantine_invalid_records",
        configuration={
            "query": {
                "query": QUARANTINE_SQL,
                "useLegacySql": False,
            }
        },
    )

    # Task 4: Deduplicate, convert FX, and idempotent MERGE into target
    transform_and_load_target = BigQueryInsertJobOperator(
        task_id="transform_and_load_target",
        configuration={
            "query": {
                "query": TRANSFORM_MERGE_SQL,
                "useLegacySql": False,
            }
        },
    )

    # Task 5: Post-load Data Quality Checks (Duplicates, Nulls, Constraints)
    data_quality_verification = DataQualityOperator(
        task_id="data_quality_verification",
        table_name=TARGET_TABLE,
        sql_checks=[
            {
                "sql": f"""
                    SELECT COUNT(1) - COUNT(DISTINCT transaction_id)
                    FROM `{TARGET_TABLE}`
                    WHERE transaction_date = '{{{{ ds }}}}'
                """,
                "expected": 0,
                "description": "Zero duplicate transaction IDs in loaded partition",
            },
            {
                "sql": f"""
                    SELECT COUNT(1)
                    FROM `{TARGET_TABLE}`
                    WHERE transaction_date = '{{{{ ds }}}}'
                      AND (transaction_id IS NULL OR customer_id IS NULL OR amount_usd IS NULL)
                """,
                "expected": 0,
                "description": "Zero NULLs in mandatory primary columns in loaded partition",
            },
        ],
    )

    # Define execution graph
    check_gcs_file >> load_csv_to_staging >> quarantine_invalid_records >> transform_and_load_target >> data_quality_verification
