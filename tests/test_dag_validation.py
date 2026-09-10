"""Unit tests for Airflow DAG structure, integrity, and operator configurations."""
import pytest
from datetime import timedelta


def test_dag_loaded_and_valid():
    """Verify that the DAG loads cleanly without errors and has expected metadata."""
    from dags.daily_customer_transactions_etl import dag

    assert dag is not None
    assert dag.dag_id == "daily_customer_transactions_etl"
    assert dag.schedule_interval == "0 2 * * *"
    assert dag.catchup is False
    assert "etl" in dag.tags
    assert "bigquery" in dag.tags
    assert "gcs" in dag.tags


def test_dag_default_args():
    """Verify that default_args contain required retry and alert settings."""
    from dags.daily_customer_transactions_etl import dag

    default_args = dag.default_args
    assert default_args["retries"] == 3
    assert default_args["retry_delay"] == timedelta(minutes=5)
    assert default_args["retry_exponential_backoff"] is True
    assert default_args["depends_on_past"] is False


def test_dag_tasks_and_dependencies():
    """Verify all 5 pipeline tasks are present and connected sequentially."""
    from dags.daily_customer_transactions_etl import dag

    task_ids = {t.task_id for t in dag.tasks}
    expected_tasks = {
        "check_gcs_file",
        "load_csv_to_staging",
        "quarantine_invalid_records",
        "transform_and_load_target",
        "data_quality_verification",
    }
    assert expected_tasks.issubset(task_ids)

    # Validate pipeline linear flow
    t1 = dag.get_task("check_gcs_file")
    t2 = dag.get_task("load_csv_to_staging")
    t3 = dag.get_task("quarantine_invalid_records")
    t4 = dag.get_task("transform_and_load_target")
    t5 = dag.get_task("data_quality_verification")

    assert t2 in t1.downstream_list
    assert t3 in t2.downstream_list
    assert t4 in t3.downstream_list
    assert t5 in t4.downstream_list


def test_data_quality_operator_instantiation():
    """Verify that DataQualityOperator initializes with correct parameters."""
    from plugins.operators.data_quality_operator import DataQualityOperator

    op = DataQualityOperator(
        task_id="test_dq",
        table_name="analytics.customer_transactions",
        min_expected_rows=1,
        sql_checks=[{"sql": "SELECT 1", "expected": 1, "description": "test"}],
    )
    assert op.task_id == "test_dq"
    assert op.table_name == "analytics.customer_transactions"
    assert op.min_expected_rows == 1
    assert len(op.sql_checks) == 1
