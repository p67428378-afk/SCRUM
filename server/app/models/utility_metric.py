import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class UtilityMetric(Base):
    __tablename__ = "utility_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    zone_id = Column(
        String(36),
        ForeignKey("zones.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    metric_type = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    recorded_at = Column(
        DateTime(timezone=True), nullable=False, default=utc_now, index=True
    )

    zone = relationship("Zone", back_populates="utility_metrics")
