"""Apache Airflow DAG for Daily Retail Orders Ingestion, Normalization, and Loading."""

from datetime import datetime, timedelta
import logging
import os

try:
    from airflow import DAG
    from airflow.decorators import task
except ImportError:
    # Allows module parsing outside Airflow environment
    DAG = None  # type: ignore
    task = lambda f: f  # type: ignore

default_args = {
    "owner": "data_engineering",
    "depends_on_past": False,
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

if DAG is not None:
    with DAG(
        dag_id="daily_retail_orders_etl",
        default_args=default_args,
        description="Daily ETL pipeline: Ingests GCS retail CSVs, cleans/deduplicates, converts currency to USD, and loads into BigQuery.",
        schedule_interval="0 5 * * *",  # 05:00 UTC daily
        start_date=datetime(2026, 1, 1),
        catchup=False,
        tags=["retail", "etl", "bigquery", "orders", "usd_normalization"],
    ) as dag:

        @task()
        def run_retail_orders_pipeline(logical_date=None, **context):
            """Executes the complete retail orders ETL pipeline."""
            from pipeline.run_retail_orders_etl import RetailOrdersETLPipeline

            exec_date = str(logical_date)[:10] if logical_date else datetime.utcnow().strftime("%Y-%m-%d")
            logging.info("Executing Retail Orders ETL DAG for date %s", exec_date)

            pipeline = RetailOrdersETLPipeline()
            result = pipeline.run(execution_date=exec_date)
            logging.info("ETL DAG completed with result: %s", result)
            return result

        run_retail_orders_pipeline()
