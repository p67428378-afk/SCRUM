"""PostgreSQL data extractor module."""
import logging
from datetime import date
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from server.models import RawSalesOrderDB

logger = logging.getLogger(__name__)


def extract_sales_orders(
    db: Session,
    batch_size: Optional[int] = None,
    date_filter: Optional[date] = None
) -> List[Dict[str, Any]]:
    """
    Extracts raw sales orders from the database.

    Args:
        db: SQLAlchemy database session.
        batch_size: Optional limit on the number of records to retrieve.
        date_filter: Optional specific date filter on order_date.

    Returns:
        List of dictionaries containing extracted raw sales order fields.
    """
    query = db.query(RawSalesOrderDB)
    if date_filter:
        query = query.filter(RawSalesOrderDB.order_date == date_filter)

    if batch_size and batch_size > 0:
        query = query.limit(batch_size)

    results = query.all()
    logger.info(f"Extracted {len(results)} records from raw_sales_orders.")

    extracted_data = []
    for row in results:
        extracted_data.append({
            "order_id": row.order_id,
            "customer_email": row.customer_email,
            "amount": row.amount,
            "order_date": row.order_date,
            "created_at": row.created_at
        })

    return extracted_data
