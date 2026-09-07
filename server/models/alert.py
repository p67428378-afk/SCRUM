import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class AlertConfig(Base):
    __tablename__ = "alert_configs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(
        String(36),
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    metric_type = Column(
        String(50), nullable=False
    )  # TEMPERATURE, WIND_SPEED, PRECIPITATION, UV_INDEX
    operator = Column(String(20), nullable=False)  # GREATER_THAN, LESS_THAN, EQUALS
    threshold_value = Column(Float, nullable=False)
    user_email = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    last_triggered_at = Column(DateTime, nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    location = relationship("Location", back_populates="alert_configs")
    notifications = relationship(
        "NotificationLog", back_populates="alert_config", cascade="all, delete-orphan"
    )


class NotificationLog(Base):
    __tablename__ = "alert_notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_config_id = Column(
        String(36),
        ForeignKey("alert_configs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    location_id = Column(
        String(36),
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    triggered_value = Column(Float, nullable=False)
    message = Column(String(500), nullable=False)
    dispatched_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    alert_config = relationship("AlertConfig", back_populates="notifications")
    location = relationship("Location", back_populates="notifications")
