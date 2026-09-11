import uuid
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Column, Date, DateTime, Float, Numeric, String
from server.database import Base


class RawSalesOrder(Base):
    """SQLAlchemy model for raw_sales_orders source table in PostgreSQL."""
    __tablename__ = "raw_sales_orders"

    order_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_email = Column(String(255), nullable=True)
    amount = Column(Float, nullable=True)
    order_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class RawSalesOrderModel(BaseModel):
    """Pydantic model representing raw sales order input."""
    order_id: str
    customer_email: Optional[str] = None
    amount: Optional[Any] = None
    order_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FctSalesOrderModel(BaseModel):
    """Pydantic model representing validated sales order loaded into BigQuery."""
    order_id: str
    customer_email: str
    amount: float
    order_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FilterBreakdown(BaseModel):
    """Breakdown of filtered records by reason."""
    missing_or_invalid_amount: int = 0
    invalid_email_rfc5322: int = 0


class ETLMetricsResponse(BaseModel):
    """Standard audit metrics response model for ETL runs."""
    execution_id: str
    timestamp: str
    records_extracted: int
    records_loaded: int
    records_filtered: int
    filter_breakdown: FilterBreakdown
    status: str
