import logging
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import text
from sqlalchemy.orm import Session

from server.database import SessionLocal, engine
from server.models import RawSalesOrder

logger = logging.getLogger("etl_pipeline.extractor")


class PostgreSQLExtractor:
    """Extractor service to query sales data from PostgreSQL raw_sales_orders table."""

    def __init__(self, db_session: Optional[Session] = None):
        self._session = db_session

    def extract_all(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Extract all unprocessed records from raw_sales_orders table."""
        close_session = False
        session = self._session
        if session is None:
            session = SessionLocal()
            close_session = True

        try:
            logger.info("Starting PostgreSQL data extraction from raw_sales_orders...")
            query = session.query(RawSalesOrder)
            if limit:
                query = query.limit(limit)
            
            rows = query.all()
            records: List[Dict[str, Any]] = []
            for row in rows:
                records.append({
                    "order_id": str(row.order_id),
                    "customer_email": row.customer_email,
                    "amount": row.amount,
                    "order_date": row.order_date.isoformat() if isinstance(row.order_date, (date, datetime)) else str(row.order_date),
                    "created_at": row.created_at.isoformat() if isinstance(row.created_at, (datetime, date)) else str(row.created_at)
                })

            logger.info("Successfully extracted %d records from PostgreSQL raw_sales_orders.", len(records))
            return records
        except Exception as exc:
            logger.error("Error extracting records from PostgreSQL: %s", exc)
            raise
        finally:
            if close_session and session:
                session.close()

    def extract_by_date_range(self, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """Extract records within a specific order_date window."""
        close_session = False
        session = self._session
        if session is None:
            session = SessionLocal()
            close_session = True

        try:
            logger.info("Extracting raw_sales_orders between %s and %s", start_date, end_date)
            rows = session.query(RawSalesOrder).filter(
                RawSalesOrder.order_date >= start_date,
                RawSalesOrder.order_date <= end_date
            ).all()

            records: List[Dict[str, Any]] = []
            for row in rows:
                records.append({
                    "order_id": str(row.order_id),
                    "customer_email": row.customer_email,
                    "amount": row.amount,
                    "order_date": row.order_date.isoformat() if isinstance(row.order_date, (date, datetime)) else str(row.order_date),
                    "created_at": row.created_at.isoformat() if isinstance(row.created_at, (datetime, date)) else str(row.created_at)
                })
            return records
        finally:
            if close_session and session:
                session.close()
