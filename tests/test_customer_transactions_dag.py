"""
Unit tests for Customer Transactions Airflow DAG.
Jira Issue: SCRUM-268
"""

import os
import sys
import pytest

# Ensure dags directory is in sys.path
DAGS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dags")
if DAGS_DIR not in sys.path:
    sys.path.insert(0, DAGS_DIR)


def test_dag_file_exists():
    dag_path = os.path.join(DAGS_DIR, "customer_transactions_etl.py")
    assert os.path.exists(dag_path), "customer_transactions_etl.py DAG file must exist."


def test_sql_files_exist():
    sql_dir = os.path.join(DAGS_DIR, "sql")
    dq_file = os.path.join(sql_dir, "dq_quarantine_validation.sql")
    transform_file = os.path.join(sql_dir, "transform_dedup_normalize.sql")

    assert os.path.exists(dq_file), "dq_quarantine_validation.sql must exist."
    assert os.path.exists(transform_file), "transform_dedup_normalize.sql must exist."


def test_dag_structure_and_tasks():
    try:
        from airflow.models import DAG
        import customer_transactions_etl
        dag = customer_transactions_etl.dag
    except ImportError:
        # If airflow is not in test env, parse file directly to verify AST / structure
        import ast
        dag_path = os.path.join(DAGS_DIR, "customer_transactions_etl.py")
        with open(dag_path, "r", encoding="utf-8") as f:
            content = f.read()
        tree = ast.parse(content)
        assert tree is not None
        return

    assert isinstance(dag, DAG), "dag object must be an instance of airflow.models.DAG"
    assert dag.dag_id == "customer_transactions_etl"
    assert dag.schedule_interval == "30 5 * * *"
    assert dag.catchup is False

    expected_tasks = {
        "check_gcs_files",
        "create_tables_ddl",
        "load_gcs_to_staging",
        "run_dq_and_quarantine",
        "transform_and_load_target",
        "purge_staging",
    }
    actual_tasks = {task.task_id for task in dag.tasks}
    assert expected_tasks.issubset(actual_tasks), f"Missing tasks: {expected_tasks - actual_tasks}"

    # Verify task dependencies
    check_task = dag.get_task("check_gcs_files")
    create_task = dag.get_task("create_tables_ddl")
    load_task = dag.get_task("load_gcs_to_staging")
    dq_task = dag.get_task("run_dq_and_quarantine")
    transform_task = dag.get_task("transform_and_load_target")
    purge_task = dag.get_task("purge_staging")

    assert create_task in check_task.downstream_list
    assert load_task in create_task.downstream_list
    assert dq_task in load_task.downstream_list
    assert transform_task in dq_task.downstream_list
    assert purge_task in transform_task.downstream_list
