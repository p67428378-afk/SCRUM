import uuid
from datetime import datetime
from sqlalchemy import Column, String, Numeric, Boolean, DateTime
from server.app.database import Base


class AlertRule(Base):
    __tablename__ = "AlertRule"

    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True
    )
    card_identifier = Column(String(4), unique=True, nullable=False)
    daily_spend_threshold = Column(Numeric, nullable=False, default=5000)
    alert_delivery_channel = Column(String(10), nullable=False, default="SMS")
    status = Column(String(20), nullable=False, default="ACTIVE")
    current_daily_spend = Column(Numeric, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class OTPTransaction(Base):
    __tablename__ = "OTPTransaction"

    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True
    )
    otp_reference_id = Column(String(36), unique=True, nullable=False)
    mobile_number = Column(String(15), nullable=False)
    otp_code = Column(String(6), nullable=False)
    is_verified = Column(Boolean, nullable=False, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
