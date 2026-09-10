import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime
from server.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_number = Column(String(50), unique=True, nullable=False)
    owner_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    balance = Column(Float, default=0.0, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
