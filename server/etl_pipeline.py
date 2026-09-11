import argparse
import logging
import sys
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from server.extractor import PostgreSQLExtractor
from server.loader import BigQueryLoader
from server.models import ETLMetricsResponse, FilterBreakdown
from server.validator import DataValidator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
)
logger = logging.getLogger("etl_pipeline")


def run_pipeline(
    limit: Optional[int] = None,
    dry_run: bool = False,
    db_session: Optional[Session] = None,
    loader: Optional[BigQueryLoader] = None,
) -> Dict[str, Any]:
    """Execute the end-to-end ETL pipeline:
    1. Extract from PostgreSQL raw_sales_orders
    2. Validate and filter records (amount & RFC 5322 email rules)
    3. Load valid records into BigQuery fct_sales_orders
    4. Return execution metrics and audit statistics
    """
    execution_id = str(uuid.uuid4())
    start_time = datetime.now(timezone.utc).isoformat()
    logger.info(">>> Starting ETL Pipeline Execution [%s] at %s", execution_id, start_time)

    try:
        # Step 1: Extraction
        extractor = PostgreSQLExtractor(db_session=db_session)
        raw_records = extractor.extract_all(limit=limit)
        records_extracted = len(raw_records)

        # Step 2: Validation & Filtering
        valid_records, breakdown, rejected_info = DataValidator.process_batch(raw_records)
        records_filtered = sum(breakdown.values())

        logger.info(
            "Validation complete: %d extracted, %d valid, %d filtered (missing/invalid amount: %d, invalid email: %d)",
            records_extracted,
            len(valid_records),
            records_filtered,
            breakdown.get("missing_or_invalid_amount", 0),
            breakdown.get("invalid_email_rfc5322", 0)
        )

        # Step 3: Loading into BigQuery
        bq_loader = loader or BigQueryLoader()
        records_loaded = bq_loader.load_records(valid_records, dry_run=dry_run)

        # Step 4: Assemble Metrics Response
        status = "SUCCESS"
        metrics = {
            "execution_id": execution_id,
            "timestamp": start_time,
            "records_extracted": records_extracted,
            "records_loaded": records_loaded,
            "records_filtered": records_filtered,
            "filter_breakdown": breakdown,
            "status": status
        }
        logger.info(">>> Finished ETL Pipeline Execution [%s] with status=%s", execution_id, status)
        return metrics

    except Exception as exc:
        logger.error("ETL Pipeline Execution [%s] failed: %s", execution_id, exc, exc_info=True)
        return {
            "execution_id": execution_id,
            "timestamp": start_time,
            "records_extracted": 0,
            "records_loaded": 0,
            "records_filtered": 0,
            "filter_breakdown": {
                "missing_or_invalid_amount": 0,
                "invalid_email_rfc5322": 0
            },
            "status": "FAILED",
            "error": str(exc)
        }


def main():
    """CLI entrypoint for executing the ETL pipeline."""
    parser = argparse.ArgumentParser(description="PostgreSQL to BigQuery Sales Orders ETL Runner")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of extracted records")
    parser.add_argument("--dry-run", action="store_true", help="Simulate BigQuery load without inserting")
    args = parser.parse_args()

    metrics = run_pipeline(limit=args.limit, dry_run=args.dry_run)
    print(metrics)
    if metrics.get("status") != "SUCCESS":
        sys.exit(1)


if __name__ == "__main__":
    main()
