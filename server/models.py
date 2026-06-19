"""
Module: models
Purpose: SQLAlchemy models for locations and weather caches.
Author: Backend Developer Agent
Created: 2026-06-19
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from server.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    name = Column(String(255), nullable=False)
    country = Column(String(100), nullable=True)
    is_default = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    caches = relationship("WeatherCache", back_populates="location", cascade="all, delete-orphan")


class WeatherCache(Base):
    __tablename__ = "weather_caches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True)
    location_id = Column(String(36), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    weather_data = Column(JSON, nullable=False)
    forecast_data = Column(JSON, nullable=False)
    insights_data = Column(JSON, nullable=True)
    cached_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    location = relationship("Location", back_populates="caches")
