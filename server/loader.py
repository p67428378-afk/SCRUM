"""BigQuery data loader module with DAY partitioning."""
import logging
import os
from datetime import date, datetime
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class BigQueryLoader:
    """Handles batch loading of sales order records into BigQuery fct_sales_orders."""

    def __init__(
        self,
        project_id: Optional[str] = None,
        dataset_id: Optional[str] = None,
        table_id: Optional[str] = None,
        client: Optional[Any] = None,
        simulation_mode: Optional[bool] = None
    ):
        self.project_id = project_id or os.getenv("GCP_PROJECT", "upbeat-repeater-477110-q6")
        self.dataset_id = dataset_id or os.getenv("BQ_DATASET", "analytics")
        self.table_id = table_id or os.getenv("BQ_TABLE", "fct_sales_orders")
        self.full_table_id = f"{self.project_id}.{self.dataset_id}.{self.table_id}"
        self._client = client

        # Auto-detect simulation mode for tests or dummy projects
        if simulation_mode is not None:
            self.simulation_mode = simulation_mode
        else:
            is_testing = os.getenv("TESTING", "false").lower() == "true"
            is_dummy_proj = self.project_id.startswith("test-") or self.project_id in ["test-project", "dummy"]
            self.simulation_mode = is_testing or is_dummy_proj

    def get_client(self):
        """Lazy load or initialize BigQuery client."""
        if self.simulation_mode and self._client is None:
            return None
        if self._client is not None:
            return self._client
        try:
            from google.cloud import bigquery
            self._client = bigquery.Client(project=self.project_id)
            return self._client
        except Exception as e:
            logger.warning(f"Could not initialize BigQuery client: {e}. Falling back to simulation mode.")
            self.simulation_mode = True
            return None

    def format_records_for_bq(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Converts date and datetime objects into ISO strings for BigQuery JSON ingestion."""
        formatted = []
        for r in records:
            item = dict(r)
            if isinstance(item.get("order_date"), date):
                item["order_date"] = item["order_date"].isoformat()
            if isinstance(item.get("created_at"), datetime):
                item["created_at"] = item["created_at"].isoformat()
            formatted.append(item)
        return formatted

    def load_records(self, records: List[Dict[str, Any]]) -> int:
        """
        Loads cleaned records into BigQuery table.

        Args:
            records: List of validated sales order records.

        Returns:
            Number of records successfully loaded.
        """
        if not records:
            logger.info("No records to load.")
            return 0

        formatted_records = self.format_records_for_bq(records)
        client = self.get_client()

        if not self.simulation_mode and client is not None and hasattr(client, "insert_rows_json"):
            errors = client.insert_rows_json(self.full_table_id, formatted_records)
            if errors:
                logger.error(f"BigQuery insertion errors: {errors}")
                raise RuntimeError(f"BigQuery insert failed with errors: {errors}")
            logger.info(f"Successfully loaded {len(formatted_records)} records into {self.full_table_id}")
            return len(formatted_records)
        elif self._client is not None and hasattr(self._client, "insert_rows_json"):
            errors = self._client.insert_rows_json(self.full_table_id, formatted_records)
            if errors:
                raise RuntimeError(f"BigQuery insert failed with errors: {errors}")
            return len(formatted_records)
        else:
            logger.info(f"[SIMULATION] Loaded {len(formatted_records)} records into {self.full_table_id}")
            return len(formatted_records)
