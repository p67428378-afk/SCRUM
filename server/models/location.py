import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import relationship
from server.database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_meters = Column(Float, nullable=True)
    status = Column(String(50), nullable=False, default="ACTIVE")
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    weather_records = relationship(
        "WeatherRecord", back_populates="location", cascade="all, delete-orphan"
    )
    forecasts = relationship(
        "WeatherForecast", back_populates="location", cascade="all, delete-orphan"
    )
    alert_configs = relationship(
        "AlertConfig", back_populates="location", cascade="all, delete-orphan"
    )
    notifications = relationship(
        "NotificationLog", back_populates="location", cascade="all, delete-orphan"
    )
