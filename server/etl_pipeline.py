"""Main ETL pipeline orchestrator."""
import logging
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import uuid4
from sqlalchemy.orm import Session
from server.database import SessionLocal, engine, Base
from server.extractor import extract_sales_orders
from server.validator import validate_and_filter_records
from server.loader import BigQueryLoader
from server.models import ETLMetricsResponse, FilterBreakdown

logger = logging.getLogger(__name__)


def run_etl_pipeline(
    db: Optional[Session] = None,
    loader: Optional[BigQueryLoader] = None,
    batch_size: Optional[int] = None,
    date_filter: Optional[Any] = None
) -> ETLMetricsResponse:
    """
    Executes the full ETL pipeline:
    1. Extract from PostgreSQL raw_sales_orders.
    2. Validate and filter out records with missing amounts or invalid RFC 5322 emails.
    3. Load valid records into BigQuery fct_sales_orders.
    4. Return audit metrics.
    """
    execution_id = str(uuid4())
    start_time = datetime.utcnow().isoformat()
    close_db_on_exit = False

    if db is None:
        db = SessionLocal()
        close_db_on_exit = True

    if loader is None:
        loader = BigQueryLoader()

    try:
        # Step 1: Extract
        logger.info(f"Starting ETL run {execution_id}")
        raw_records = extract_sales_orders(db, batch_size=batch_size, date_filter=date_filter)
        records_extracted = len(raw_records)

        # Step 2: Validate & Filter
        valid_records, rejected_records, filter_breakdown = validate_and_filter_records(raw_records)
        records_filtered = len(rejected_records)

        # Step 3: Load
        records_loaded = loader.load_records(valid_records)

        # Step 4: Metrics summary
        metrics = ETLMetricsResponse(
            execution_id=execution_id,
            timestamp=start_time,
            records_extracted=records_extracted,
            records_loaded=records_loaded,
            records_filtered=records_filtered,
            filter_breakdown=filter_breakdown,
            status="SUCCESS"
        )
        logger.info(f"ETL run {execution_id} completed successfully: {metrics.dict()}")
        return metrics

    except Exception as e:
        logger.exception(f"ETL run {execution_id} failed: {e}")
        return ETLMetricsResponse(
            execution_id=execution_id,
            timestamp=start_time,
            records_extracted=0,
            records_loaded=0,
            records_filtered=0,
            filter_breakdown=FilterBreakdown(),
            status=f"FAILED: {str(e)}"
        )
    finally:
        if close_db_on_exit:
            db.close()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    result = run_etl_pipeline()
    print(result.json(indent=2))
