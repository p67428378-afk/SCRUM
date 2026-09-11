"""Data Extraction Module from PostgreSQL raw_sales_orders."""
import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from server.models import RawSalesOrder, RawSalesOrderDB

logger = logging.getLogger(__name__)


class PostgreSQLExtractor:
    """Extracts raw sales orders from database."""

    def __init__(self, db_session: Session):
        self.db = db_session

    def extract_raw_orders(self, limit: Optional[int] = None) -> List[RawSalesOrder]:
        """Extract all raw orders from the raw_sales_orders table."""
        try:
            query = self.db.query(RawSalesOrderDB)
            if limit:
                query = query.limit(limit)
            db_records = query.all()
            records = [RawSalesOrder.model_validate(r) for r in db_records]
            logger.info(f"Successfully extracted {len(records)} raw sales orders.")
            return records
        except Exception as e:
            logger.error(f"Error during raw sales orders extraction: {str(e)}")
            raise
