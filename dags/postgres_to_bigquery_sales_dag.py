"""Airflow DAG for PostgreSQL to BigQuery Sales Orders ETL Pipeline."""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator


def extract_and_load_sales_orders():
    """Airflow PythonOperator callback executing the modular ETL pipeline."""
    from server.etl_pipeline import run_pipeline
    metrics = run_pipeline()
    if metrics.get("status") != "SUCCESS":
        raise RuntimeError(f"ETL pipeline execution failed: {metrics.get('error')}")
    return metrics


default_args = {
    "owner": "data_engineering",
    "depends_on_past": False,
    "start_date": datetime(2025, 1, 1),
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="postgres_to_bigquery_sales_orders",
    default_args=default_args,
    description="Extract raw sales from PostgreSQL, filter invalid records, and load into BigQuery fct_sales_orders (DAY partitioned)",
    schedule_interval="@daily",
    catchup=False,
    tags=["sales", "etl", "postgresql", "bigquery"],
) as dag:

    run_etl_task = PythonOperator(
        task_id="extract_filter_load_sales_orders",
        python_callable=extract_and_load_sales_orders,
    )

    run_etl_task
