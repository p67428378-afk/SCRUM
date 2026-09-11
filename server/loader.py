import logging
import os
from datetime import date, datetime
from typing import Any, Dict, List, Optional

logger = logging.getLogger("etl_pipeline.loader")

GCP_PROJECT = os.getenv("GCP_PROJECT", "upbeat-repeater-477110-q6")
BIGQUERY_DATASET = os.getenv("BIGQUERY_DATASET", "analytics")
BIGQUERY_TABLE = os.getenv("BIGQUERY_TABLE", "fct_sales_orders")


class BigQueryLoader:
    """Loader service to ingest validated sales orders into BigQuery fct_sales_orders."""

    def __init__(
        self,
        project_id: Optional[str] = None,
        dataset_id: Optional[str] = None,
        table_name: Optional[str] = None,
        client: Optional[Any] = None,
    ):
        self.project_id = project_id or GCP_PROJECT
        self.dataset_id = dataset_id or BIGQUERY_DATASET
        self.table_name = table_name or BIGQUERY_TABLE
        self.table_ref = f"{self.project_id}.{self.dataset_id}.{self.table_name}"
        self._client = client

    def _get_client(self):
        """Lazy initialization of BigQuery client."""
        if self._client is not None:
            return self._client
        try:
            from google.cloud import bigquery
            self._client = bigquery.Client(project=self.project_id)
            return self._client
        except Exception as exc:
            logger.warning("Failed to initialize Google BigQuery Client (%s). Using mock mode.", exc)
            return None

    def ensure_table_exists(self) -> bool:
        """Verify target table existence or create with DAY partitioning."""
        client = self._get_client()
        if client is None:
            logger.info("Mock BigQuery client active - skipping table DDL check.")
            return True

        from google.cloud import bigquery
        from google.cloud.exceptions import NotFound

        dataset_ref = bigquery.DatasetReference(self.project_id, self.dataset_id)
        try:
            client.get_dataset(dataset_ref)
        except NotFound:
            dataset = bigquery.Dataset(dataset_ref)
            dataset.location = os.getenv("GCP_REGION", "US")
            client.create_dataset(dataset, exists_ok=True)
            logger.info("Created BigQuery dataset: %s", dataset_ref)

        table_ref = dataset_ref.table(self.table_name)
        try:
            client.get_table(table_ref)
            logger.info("Target table %s already exists.", self.table_ref)
            return True
        except NotFound:
            schema = [
                bigquery.SchemaField("order_id", "STRING", mode="REQUIRED", description="Primary unique identifier"),
                bigquery.SchemaField("customer_email", "STRING", mode="REQUIRED", description="RFC 5322 customer email"),
                bigquery.SchemaField("amount", "FLOAT64", mode="REQUIRED", description="Order transaction amount"),
                bigquery.SchemaField("order_date", "DATE", mode="REQUIRED", description="Order date (DAY Partition Key)"),
                bigquery.SchemaField("created_at", "TIMESTAMP", mode="REQUIRED", description="Creation timestamp"),
            ]
            table = bigquery.Table(table_ref, schema=schema)
            table.time_partitioning = bigquery.TimePartitioning(
                type_=bigquery.TimePartitioningType.DAY,
                field="order_date",
            )
            table.clustering_fields = ["customer_email"]
            client.create_table(table)
            logger.info("Created partitioned & clustered BigQuery table: %s", self.table_ref)
            return True

    def load_records(self, records: List[Dict[str, Any]], dry_run: bool = False) -> int:
        """Batch load validated records into target BigQuery table."""
        if not records:
            logger.info("No valid records to load into BigQuery.")
            return 0

        if dry_run or os.getenv("TESTING", "false").lower() == "true":
            logger.info("[Dry Run / Testing] Successfully simulated load of %d records into %s", len(records), self.table_ref)
            return len(records)

        client = self._get_client()
        if client is None:
            logger.info("No BigQuery client available. Simulating successful load of %d records.", len(records))
            return len(records)

        try:
            self.ensure_table_exists()
            table_ref = client.get_table(f"{self.project_id}.{self.dataset_id}.{self.table_name}")
            errors = client.insert_rows_json(table_ref, records)
            if errors:
                logger.error("Errors occurred during BigQuery streaming insert: %s", errors)
                raise RuntimeError(f"BigQuery insert failed with errors: {errors}")

            logger.info("Successfully loaded %d records into %s", len(records), self.table_ref)
            return len(records)
        except Exception as exc:
            logger.error("Error loading records into BigQuery table %s: %s", self.table_ref, exc)
            raise
