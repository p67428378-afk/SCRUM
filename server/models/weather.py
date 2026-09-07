import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from server.database import Base


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(
        String(36),
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    temperature_celsius = Column(Float, nullable=False)
    humidity_percent = Column(Float, nullable=False)
    wind_speed_mph = Column(Float, nullable=False)
    wind_direction = Column(String(50), nullable=True)
    precipitation_inches = Column(Float, nullable=False, default=0.0)
    pressure_hpa = Column(Float, nullable=False)
    uv_index = Column(Float, nullable=False, default=0.0)
    recorded_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True
    )
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    location = relationship("Location", back_populates="weather_records")


Index(
    "idx_weather_location_recorded",
    WeatherRecord.location_id,
    WeatherRecord.recorded_at.desc(),
)
