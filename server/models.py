import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="farm_manager")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class Field(Base):
    __tablename__ = "fields"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    acreage = Column(Float, nullable=False)
    location_gis = Column(String, nullable=True)
    soil_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    crop_cycles = relationship(
        "CropCycle", back_populates="field", cascade="all, delete-orphan"
    )


class CropCycle(Base):
    __tablename__ = "crop_cycles"

    id = Column(String, primary_key=True, default=generate_uuid)
    field_id = Column(String, ForeignKey("fields.id"), nullable=False)
    crop_type = Column(String, nullable=False)
    planting_date = Column(String, nullable=False)
    target_harvest_date = Column(String, nullable=True)
    soil_health_notes = Column(Text, nullable=True)
    status = Column(String, default="PLANTED")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    field = relationship("Field", back_populates="crop_cycles")


class Livestock(Base):
    __tablename__ = "livestock"

    id = Column(String, primary_key=True, default=generate_uuid)
    tag_number = Column(String, unique=True, index=True, nullable=False)
    species = Column(String, nullable=False)
    breed = Column(String, nullable=True)
    birth_date = Column(String, nullable=True)
    status = Column(String, default="HEALTHY")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    health_records = relationship(
        "HealthRecord", back_populates="livestock", cascade="all, delete-orphan"
    )
    feeding_logs = relationship(
        "FeedingLog", back_populates="livestock", cascade="all, delete-orphan"
    )


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    livestock_id = Column(String, ForeignKey("livestock.id"), nullable=False)
    event_type = Column(String, nullable=False)
    event_date = Column(String, nullable=False)
    medication_name = Column(String, nullable=False)
    next_due_date = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    livestock = relationship("Livestock", back_populates="health_records")


class FeedingLog(Base):
    __tablename__ = "feeding_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    livestock_id = Column(String, ForeignKey("livestock.id"), nullable=False)
    feed_type = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, default="kg")
    feeding_time = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    livestock = relationship("Livestock", back_populates="feeding_logs")


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    serial_number = Column(String, nullable=False)
    operating_hours = Column(Float, default=0.0)
    status = Column(String, default="OPERATIONAL")
    last_service_date = Column(String, nullable=True)
    maintenance_threshold_hours = Column(Float, default=500.0)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    maintenance_logs = relationship(
        "MaintenanceLog", back_populates="equipment", cascade="all, delete-orphan"
    )


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    equipment_id = Column(String, ForeignKey("equipment.id"), nullable=False)
    service_date = Column(String, nullable=False)
    operating_hours_logged = Column(Float, default=0.0)
    service_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    cost = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    equipment = relationship("Equipment", back_populates="maintenance_logs")


class InventoryItem(Base):
    __tablename__ = "input_inventory"

    id = Column(String, primary_key=True, default=generate_uuid)
    item_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Float, default=0.0)
    unit = Column(String, nullable=False)
    reorder_threshold = Column(Float, default=10.0)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class OperationalAlert(Base):
    __tablename__ = "operational_alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    alert_type = Column(String, nullable=False)
    severity = Column(String, default="WARNING")
    message = Column(String, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
