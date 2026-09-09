import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Date, DateTime
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def utc_now():
    return datetime.now(timezone.utc)


class Drug(Base):
    __tablename__ = "drugs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    generic_name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=False)
    manufacturer = Column(String(255), nullable=False)
    batch_number = Column(String(100), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    expiration_date = Column(Date, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    unit_price = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )
