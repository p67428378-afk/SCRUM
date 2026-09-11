"""Data models and schemas for the ETL pipeline."""
from datetime import date, datetime
from typing import Dict, Optional
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Column, Date, DateTime, Float, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class RawSalesOrderDB(Base):
    """SQLAlchemy model for PostgreSQL raw_sales_orders table."""
    __tablename__ = "raw_sales_orders"

    order_id = Column(String(36), primary_key=True)
    customer_email = Column(String(255), nullable=True)
    amount = Column(Float, nullable=True)
    order_date = Column(Date, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class RawSalesOrder(BaseModel):
    """Pydantic model representing raw sales order from PostgreSQL."""
    model_config = ConfigDict(from_attributes=True)

    order_id: str
    customer_email: Optional[str] = None
    amount: Optional[float] = None
    order_date: date
    created_at: datetime


class FctSalesOrder(BaseModel):
    """Pydantic model representing cleaned target sales order for BigQuery."""
    model_config = ConfigDict(from_attributes=True)

    order_id: str
    customer_email: str
    amount: float
    order_date: date
    created_at: datetime


class FilterBreakdown(BaseModel):
    """Breakdown of filtered records by rejection reason."""
    missing_or_invalid_amount: int = 0
    invalid_email_rfc5322: int = 0


class ETLMetricsResponse(BaseModel):
    """API response model for ETL pipeline execution metrics."""
    execution_id: str
    timestamp: str
    records_extracted: int
    records_loaded: int
    records_filtered: int
    filter_breakdown: FilterBreakdown
    status: str
