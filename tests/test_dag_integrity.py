"""DAG integrity and structure validation tests."""
import ast
import os
import pytest

def test_dag_file_exists():
    """Verify DAG file exists in dags/ directory."""
    dag_path = os.path.join("dags", "customer_transactions_etl_dag.py")
    assert os.path.exists(dag_path), f"DAG file missing at {dag_path}"

def test_dag_ast_syntax():
    """Verify DAG Python file parses without syntax errors."""
    dag_path = os.path.join("dags", "customer_transactions_etl_dag.py")
    with open(dag_path, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read())
    assert tree is not None

def test_dag_definition_and_schedule():
    """Verify DAG attributes (schedule, tags, tasks, operators)."""
    with open(os.path.join("dags", "customer_transactions_etl_dag.py"), "r", encoding="utf-8") as f:
        content = f.read()

    # Schedule: 30 5 * * *
    assert "30 5 * * *" in content
    # Dag ID
    assert 'dag_id="customer_transactions_etl"' in content or "dag_id='customer_transactions_etl'" in content
    # Source bucket and dataset
    assert "sdlc-etl-transactions-477110" in content
    assert "analytics" in content
    assert "customer_transactions" in content
    # Target operators mentioned
    assert "GCSToBigQueryOperator" in content
    assert "BigQueryInsertJobOperator" in content
    # Merge SQL presence
    assert "MERGE" in content

def test_dag_import_if_airflow_installed():
    """If airflow is installed, import and inspect DAG structure directly."""
    try:
        from dags.customer_transactions_etl_dag import dag
        assert dag is not None
        assert dag.dag_id == "customer_transactions_etl"
        assert dag.schedule_interval == "30 5 * * *"
        assert len(dag.tasks) == 4
        task_ids = [t.task_id for t in dag.tasks]
        assert "extract_transform_stage_parquet" in task_ids
        assert "load_staging_to_bq_temp" in task_ids
        assert "merge_staging_to_target" in task_ids
        assert "validate_data_quality" in task_ids
    except ImportError:
        pytest.skip("Airflow module not installed in current test environment.")
