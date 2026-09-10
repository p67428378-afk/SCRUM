import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, String, Numeric, DateTime
from server.database import Base, GUID


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    sender_id = Column(GUID, nullable=False, index=True)
    receiver_id = Column(GUID, nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(32), nullable=False, default="COMPLETED")
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
