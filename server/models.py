
import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from server.database import Base
import datetime

class Renters(Base):
    __tablename__ = "renters"
    renter_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class CarOwners(Base):
    __tablename__ = "car_owners"
    owner_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Cars(Base):
    __tablename__ = "cars"
    car_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("car_owners.owner_id"))
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    daily_rate = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    vin = Column(String, unique=True, nullable=False)
    license_plate = Column(String, unique=True, nullable=False)
    current_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.location_id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    owner = relationship("CarOwners")
    current_location = relationship("Locations")

class Locations(Base):
    __tablename__ = "locations"
    location_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    address = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Rentals(Base):
    __tablename__ = "rentals"
    rental_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    car_id = Column(UUID(as_uuid=True), ForeignKey("cars.car_id"))
    renter_id = Column(UUID(as_uuid=True), ForeignKey("renters.renter_id"))
    pickup_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.location_id"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_price = Column(Float, nullable=False)
    payment_status = Column(String, nullable=False)
    rental_status = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    car = relationship("Cars")
    renter = relationship("Renters")
    pickup_location = relationship("Locations")

class Messages(Base):
    __tablename__ = "messages"
    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rental_id = Column(UUID(as_uuid=True), ForeignKey("rentals.rental_id"))
    sender_id = Column(UUID(as_uuid=True), nullable=False)
    recipient_id = Column(UUID(as_uuid=True), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    rental = relationship("Rentals")
