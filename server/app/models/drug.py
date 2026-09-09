import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Numeric, Date, DateTime
from server.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Drug(Base):
    __tablename__ = "drugs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    generic_name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=False)
    manufacturer = Column(String(255), nullable=False)
    batch_number = Column(String(100), nullable=False)
    stock_quantity = Column(Integer, nullable=False)
    expiration_date = Column(Date, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    unit_price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )
