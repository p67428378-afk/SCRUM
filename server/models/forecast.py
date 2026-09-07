import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from server.database import Base


class WeatherForecast(Base):
    __tablename__ = "weather_forecasts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id = Column(
        String(36),
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    forecast_date = Column(Date, nullable=False, index=True)
    forecast_hour = Column(Integer, nullable=False, default=12)
    temp_min_celsius = Column(Float, nullable=False)
    temp_max_celsius = Column(Float, nullable=False)
    precipitation_probability = Column(Float, nullable=False, default=0.0)
    wind_speed_mph = Column(Float, nullable=False, default=0.0)
    condition_text = Column(String(100), nullable=True, default="Sunny")
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    location = relationship("Location", back_populates="forecasts")


Index(
    "idx_forecast_loc_date", WeatherForecast.location_id, WeatherForecast.forecast_date
)
