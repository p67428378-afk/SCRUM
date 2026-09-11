import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def utc_now():
    return datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="Resident", nullable=False)  # Resident, Driver, Admin
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    pickup_requests = relationship("PickupRequest", back_populates="user")
    routes = relationship("CollectionRoute", back_populates="driver")


class WasteBin(Base):
    __tablename__ = "waste_bins"

    id = Column(String, primary_key=True, default=generate_uuid)
    serial_number = Column(String, unique=True, index=True, nullable=False)
    location_address = Column(String, nullable=False)
    zone_code = Column(String, nullable=False)
    waste_type = Column(
        String, nullable=False
    )  # General Waste, Recyclables, Hazardous, Organic
    fill_level_pct = Column(Integer, default=0)
    status = Column(String, default="Empty")  # Empty, Moderate, Full, Overflowing
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    tasks = relationship("RouteTask", back_populates="bin")


class PickupRequest(Base):
    __tablename__ = "pickup_requests"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    tracking_code = Column(String, unique=True, index=True, nullable=False)
    waste_type = Column(String, nullable=False)
    address = Column(String, nullable=False)
    scheduled_date = Column(String, nullable=False)
    time_slot = Column(String, nullable=False)
    special_notes = Column(String, nullable=True)
    status = Column(
        String, default="Confirmed"
    )  # Confirmed, Pending, Scheduled, Completed, Cancelled
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="pickup_requests")
    tasks = relationship("RouteTask", back_populates="pickup")


class CollectionRoute(Base):
    __tablename__ = "collection_routes"

    id = Column(String, primary_key=True, default=generate_uuid)
    driver_id = Column(String, ForeignKey("users.id"), nullable=True)
    route_name = Column(String, nullable=False)
    zone_code = Column(String, nullable=False)
    scheduled_date = Column(String, nullable=False)
    status = Column(
        String, default="Pending"
    )  # Pending, In Progress, Completed, Cancelled
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    driver = relationship("User", back_populates="routes")
    tasks = relationship(
        "RouteTask", back_populates="route", cascade="all, delete-orphan"
    )


class RouteTask(Base):
    __tablename__ = "route_tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    route_id = Column(String, ForeignKey("collection_routes.id"), nullable=False)
    bin_id = Column(String, ForeignKey("waste_bins.id"), nullable=True)
    pickup_id = Column(String, ForeignKey("pickup_requests.id"), nullable=True)
    sequence_number = Column(Integer, default=1)
    task_status = Column(
        String, default="Pending"
    )  # Pending, In Progress, Completed, Skipped
    collected_weight_kg = Column(Float, default=0.0)
    skip_reason = Column(String, nullable=True)
    evidence_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    route = relationship("CollectionRoute", back_populates="tasks")
    bin = relationship("WasteBin", back_populates="tasks")
    pickup = relationship("PickupRequest", back_populates="tasks")
