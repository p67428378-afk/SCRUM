"""Automated tests for pipeline customer_transactions_etl."""
import ast
import os
import pytest
from pipeline.run_customer_transactions_etl import CustomerTransactionsETLRunner

def test_dag_syntax():
    """Verifies that the Airflow DAG has valid Python AST syntax."""
    dag_path = os.path.join("dags", "customer_transactions_etl_dag.py")
    assert os.path.isfile(dag_path), f"DAG file missing: {dag_path}"
    with open(dag_path, "r", encoding="utf-8") as f:
        code = f.read()
    tree = ast.parse(code)
    assert tree is not None

def test_standalone_script_syntax():
    """Verifies that the standalone pipeline script has valid syntax."""
    script_path = os.path.join("pipeline", "run_customer_transactions_etl.py")
    assert os.path.isfile(script_path), f"Script file missing: {script_path}"
    with open(script_path, "r", encoding="utf-8") as f:
        code = f.read()
    tree = ast.parse(code)
    assert tree is not None

def test_pipeline_runner_end_to_end(tmp_path):
    """Verifies end-to-end execution of the standalone pipeline runner with dry_run."""
    runner = CustomerTransactionsETLRunner(
        execution_date="2025-05-18",
        bucket="sdlc-etl-transactions-477110",
        staging_dir=str(tmp_path),
        dry_run=True,
    )
    exit_code = runner.run()
    assert exit_code == 0
    assert os.path.exists(os.path.join(str(tmp_path), "data.parquet"))
