"""Main ETL Pipeline Orchestrator."""
from datetime import datetime, timezone
import logging
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from server.database import SessionLocal
from server.extractor import PostgreSQLExtractor
from server.loader import BigQueryLoader
from server.models import ETLMetricsResponse, FilterBreakdown
from server.validator import DataValidator

logger = logging.getLogger(__name__)


class ETLPipeline:
    """ETL Pipeline orchestrating Extract -> Transform/Filter -> Load."""

    def __init__(
        self,
        db_session: Optional[Session] = None,
        loader: Optional[BigQueryLoader] = None,
    ):
        self._owns_db = db_session is None
        self.db = db_session if db_session is not None else SessionLocal()
        self.extractor = PostgreSQLExtractor(self.db)
        self.validator = DataValidator()
        self.loader = loader or BigQueryLoader()

    def run(self, limit: Optional[int] = None) -> ETLMetricsResponse:
        """Execute the complete ETL pipeline."""
        execution_id = str(uuid.uuid4())
        start_time = datetime.now(timezone.utc).isoformat()
        logger.info(f"Starting ETL run: execution_id={execution_id}")

        try:
            # 1. Extract
            raw_records = self.extractor.extract_raw_orders(limit=limit)
            total_extracted = len(raw_records)

            # 2. Transform & Filter
            valid_records, breakdown = self.validator.validate_records(raw_records)
            total_filtered = (
                breakdown.missing_or_invalid_amount + breakdown.invalid_email_rfc5322
            )

            # 3. Load
            total_loaded = self.loader.load_orders(valid_records)

            logger.info(
                f"ETL run finished successfully: extracted={total_extracted}, "
                f"filtered={total_filtered}, loaded={total_loaded}"
            )

            return ETLMetricsResponse(
                execution_id=execution_id,
                timestamp=start_time,
                records_extracted=total_extracted,
                records_loaded=total_loaded,
                records_filtered=total_filtered,
                filter_breakdown=breakdown,
                status="SUCCESS",
            )
        except Exception as e:
            logger.error(f"ETL pipeline execution failed: {str(e)}")
            return ETLMetricsResponse(
                execution_id=execution_id,
                timestamp=start_time,
                records_extracted=0,
                records_loaded=0,
                records_filtered=0,
                filter_breakdown=FilterBreakdown(),
                status=f"FAILED: {str(e)}",
            )
        finally:
            if self._owns_db and hasattr(self.db, "close"):
                self.db.close()


def run_etl():
    """CLI runner function."""
    pipeline = ETLPipeline()
    result = pipeline.run()
    print(result.model_dump_json(indent=2))
    return result


if __name__ == "__main__":
    run_etl()
