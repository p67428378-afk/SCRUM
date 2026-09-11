"""Data Ingestion / Loader Module for BigQuery."""
import logging
import os
from typing import Any, Dict, List
from server.models import FctSalesOrder

logger = logging.getLogger(__name__)


class BigQueryLoader:
    """Loads validated sales orders into BigQuery fct_sales_orders table."""

    def __init__(
        self,
        project_id: str = None,
        dataset_id: str = "analytics",
        table_id: str = "fct_sales_orders",
        client: Any = None,
    ):
        self.project_id = project_id or os.getenv("GCP_PROJECT_ID", "local-project")
        self.dataset_id = dataset_id or os.getenv("BIGQUERY_DATASET", "analytics")
        self.table_id = table_id or os.getenv("BIGQUERY_TABLE", "fct_sales_orders")
        self.full_table_id = f"{self.project_id}.{self.dataset_id}.{self.table_id}"
        self.client = client

    def _get_client(self):
        """Lazily initialize BigQuery client."""
        if self.client is None:
            try:
                from google.cloud import bigquery
                self.client = bigquery.Client(project=self.project_id)
            except Exception as e:
                logger.warning(f"Could not initialize native BigQuery client: {e}. Using simulated client.")
                self.client = None
        return self.client

    def load_orders(self, orders: List[FctSalesOrder]) -> int:
        """
        Loads records into BigQuery table.
        Converts FctSalesOrder items into dicts suitable for BigQuery.
        """
        if not orders:
            logger.info("No records to load.")
            return 0

        rows_to_insert = [
            {
                "order_id": order.order_id,
                "customer_email": order.customer_email,
                "amount": float(order.amount),
                "order_date": order.order_date.isoformat(),
                "created_at": order.created_at.isoformat(),
            }
            for order in orders
        ]

        client = self._get_client()
        if client is not None:
            errors = client.insert_rows_json(self.full_table_id, rows_to_insert)
            if errors:
                raise RuntimeError(f"Encountered errors while inserting rows to BigQuery: {errors}")
            logger.info(f"Loaded {len(rows_to_insert)} rows to BigQuery table {self.full_table_id}.")
        else:
            logger.info(f"[SIMULATED] Loaded {len(rows_to_insert)} rows to BigQuery table {self.full_table_id}.")

        return len(rows_to_insert)
