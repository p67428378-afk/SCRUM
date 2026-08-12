"""
Module: bus_tracking
Purpose: Database models for Bus, Route, Stop, RouteStop, Alert, and TelemetryLog
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship as sqla_relationship
from server.app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def current_utc_time():
    return datetime.now(timezone.utc)


class Route(Base):
    __tablename__ = "routes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    path_geojson = Column(Text, nullable=True)  # JSON string of path coordinates
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=current_utc_time)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=current_utc_time,
        onupdate=current_utc_time,
    )

    route_stops = sqla_relationship(
        "RouteStop",
        back_populates="route",
        cascade="all, delete-orphan",
        order_by="RouteStop.stop_order",
    )
    buses = sqla_relationship("Bus", back_populates="route")


class Stop(Base):
    __tablename__ = "stops"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False, default=current_utc_time)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=current_utc_time,
        onupdate=current_utc_time,
    )

    route_stops = sqla_relationship(
        "RouteStop", back_populates="stop", cascade="all, delete-orphan"
    )
    alerts = sqla_relationship("Alert", back_populates="stop")


class RouteStop(Base):
    __tablename__ = "route_stops"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    route_id = Column(String(36), ForeignKey("routes.id"), nullable=False)
    stop_id = Column(String(36), ForeignKey("stops.id"), nullable=False)
    stop_order = Column(Integer, nullable=False, default=1)
    estimated_time_offset_minutes = Column(Integer, nullable=False, default=0)

    route = sqla_relationship("Route", back_populates="route_stops")
    stop = sqla_relationship("Stop", back_populates="route_stops")


class Bus(Base):
    __tablename__ = "buses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bus_number = Column(String, nullable=False, unique=True)
    license_plate = Column(String, nullable=True)
    route_id = Column(String(36), ForeignKey("routes.id"), nullable=True)
    driver_name = Column(String, nullable=True)
    status = Column(
        String, nullable=False, default="Active"
    )  # Active, Offline/Stale, Maintenance
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    speed_mph = Column(Float, nullable=False, default=0.0)
    heading = Column(Float, nullable=False, default=0.0)
    last_seen_at = Column(DateTime, nullable=True, default=current_utc_time)
    created_at = Column(DateTime, nullable=False, default=current_utc_time)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=current_utc_time,
        onupdate=current_utc_time,
    )

    route = sqla_relationship("Route", back_populates="buses")
    telemetry_logs = sqla_relationship(
        "TelemetryLog", back_populates="bus", cascade="all, delete-orphan"
    )
    alerts = sqla_relationship("Alert", back_populates="bus")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_email = Column(String, nullable=False)
    bus_id = Column(String(36), ForeignKey("buses.id"), nullable=True)
    stop_id = Column(String(36), ForeignKey("stops.id"), nullable=True)
    threshold_minutes = Column(Integer, nullable=True, default=5)
    threshold_miles = Column(Float, nullable=True, default=1.0)
    is_triggered = Column(Boolean, nullable=False, default=False)
    message = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=current_utc_time)

    bus = sqla_relationship("Bus", back_populates="alerts")
    stop = sqla_relationship("Stop", back_populates="alerts")


class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bus_id = Column(String(36), ForeignKey("buses.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed_mph = Column(Float, nullable=False, default=0.0)
    timestamp = Column(DateTime, nullable=False, default=current_utc_time)

    bus = sqla_relationship("Bus", back_populates="telemetry_logs")
