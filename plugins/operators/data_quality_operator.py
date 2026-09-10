"""Data Quality Operator for ETL pipeline validation."""
from typing import Any, Dict, List, Optional, Sequence

try:
    from airflow.models import BaseOperator
    from airflow.providers.google.cloud.hooks.bigquery import BigQueryHook
except ImportError:
    class BaseOperator:  # type: ignore
        def __init__(self, task_id: str, **kwargs: Any) -> None:
            self.task_id = task_id
            self.downstream_list: List[Any] = []
            self.upstream_list: List[Any] = []
            for k, v in kwargs.items():
                setattr(self, k, v)
            try:
                from dags.daily_customer_transactions_etl import _current_dag
                if _current_dag is not None and self not in _current_dag.tasks:
                    _current_dag.tasks.append(self)
            except Exception:
                pass

        def __rshift__(self, other: Any) -> Any:
            if other not in self.downstream_list:
                self.downstream_list.append(other)
            if hasattr(other, "upstream_list") and self not in other.upstream_list:
                other.upstream_list.append(self)
            return other

    class BigQueryHook:  # type: ignore
        def __init__(self, gcp_conn_id: str = "google_cloud_default", use_legacy_sql: bool = False) -> None:
            self.gcp_conn_id = gcp_conn_id
            self.use_legacy_sql = use_legacy_sql

        def get_records(self, sql: str) -> List[Any]:
            return []


class DataQualityOperator(BaseOperator):
    """
    Operator to execute SQL data quality checks and raise an exception if assertions fail.
    
    Supports:
    - Null checks on critical columns
    - Uniqueness checks on primary key / transaction_id
    - Minimum record count assertions
    - Custom SQL condition evaluations
    """

    template_fields: Sequence[str] = ("sql_checks", "table_name", "partition_date")
    template_ext: Sequence[str] = (".sql",)
    ui_color: str = "#89DA59"

    def __init__(
        self,
        *,
        task_id: str,
        table_name: str,
        gcp_conn_id: str = "google_cloud_default",
        sql_checks: Optional[List[Dict[str, Any]]] = None,
        min_expected_rows: int = 0,
        partition_date: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        super().__init__(task_id=task_id, **kwargs)
        self.table_name = table_name
        self.gcp_conn_id = gcp_conn_id
        self.sql_checks = sql_checks or []
        self.min_expected_rows = min_expected_rows
        self.partition_date = partition_date

    def execute(self, context: Dict[str, Any]) -> None:
        """Execute all configured data quality checks against BigQuery."""
        hook = BigQueryHook(gcp_conn_id=self.gcp_conn_id, use_legacy_sql=False)

        # 1. Check row count assertion
        if self.min_expected_rows > 0:
            count_sql = f"SELECT COUNT(1) FROM `{self.table_name}`"
            if self.partition_date:
                count_sql += f" WHERE transaction_date = '{self.partition_date}'"
            
            records = hook.get_records(count_sql)
            if not records or records[0][0] < self.min_expected_rows:
                actual = records[0][0] if records else 0
                raise ValueError(
                    f"Data quality check failed for {self.table_name}: "
                    f"Expected >= {self.min_expected_rows} rows, found {actual}"
                )

        # 2. Check custom assertion SQL queries
        for check in self.sql_checks:
            sql = check.get("sql")
            expected = check.get("expected")
            description = check.get("description", "Quality check")

            if not sql:
                continue

            records = hook.get_records(sql)
            if not records:
                raise ValueError(f"Data quality query '{description}' returned no results: {sql}")

            actual = records[0][0]
            if expected is not None and actual != expected:
                raise ValueError(
                    f"Data quality check '{description}' failed for {self.table_name}. "
                    f"Expected {expected}, got {actual}. Query: {sql}"
                )
