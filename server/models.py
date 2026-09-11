"""Data models and Pydantic schemas for the ETL pipeline."""
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4
from pydantic import BaseModel, Field
from sqlalchemy import Column, Date, DateTime, Float, Numeric, String
from server.database import Base


class RawSalesOrderDB(Base):
    """SQLAlchemy model for PostgreSQL raw_sales_orders table."""
    __tablename__ = "raw_sales_orders"

    order_id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    customer_email = Column(String(255), nullable=True)
    amount = Column(Float, nullable=True)
    order_date = Column(Date, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class RawSalesOrder(BaseModel):
    """Schema representing raw ingested sales order data."""
    order_id: str
    customer_email: Optional[str] = None
    amount: Optional[Any] = None
    order_date: date
    created_at: datetime

    class Config:
        from_attributes = True


class FctSalesOrder(BaseModel):
    """Target BigQuery fct_sales_orders schema."""
    order_id: str
    customer_email: str
    amount: float
    order_date: date
    created_at: datetime

    class Config:
        from_attributes = True


class FilterBreakdown(BaseModel):
    """Breakdown of filtered records by reason."""
    missing_or_invalid_amount: int = 0
    invalid_email_rfc5322: int = 0


class ETLRunRequest(BaseModel):
    """Request payload for triggering the ETL pipeline."""
    batch_size: Optional[int] = 1000
    date_filter: Optional[date] = None


class ETLMetricsResponse(BaseModel):
    """Response model representing ETL execution metrics."""
    execution_id: str
    timestamp: str
    records_extracted: int
    records_loaded: int
    records_filtered: int
    filter_breakdown: FilterBreakdown
    status: str


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str
    service: str
    version: str
