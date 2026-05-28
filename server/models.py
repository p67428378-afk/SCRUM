
import uuid
from sqlalchemy import Column, String, Integer, Numeric, Text, ARRAY, TIMESTAMP, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base

class Renter(Base):
    __tablename__ = "Renters"
    renter_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default='now()')
    updated_at = Column(TIMESTAMP, server_default='now()', onupdate='now()')

class CarOwner(Base):
    __tablename__ = "CarOwners"
    owner_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default='now()')
    updated_at = Column(TIMESTAMP, server_default='now()', onupdate='now()')

class Car(Base):
    __tablename__ = "Cars"
    car_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("CarOwners.owner_id"))
    make = Column(String)
    model = Column(String)
    year = Column(Integer)
    vin = Column(String, unique=True)
    license_plate = Column(String, unique=True)
    daily_rate = Column(Numeric)
    status = Column(String)
    image_urls = Column(ARRAY(String))
    description = Column(Text)
    current_location_id = Column(UUID(as_uuid=True), ForeignKey("Locations.location_id"))
    created_at = Column(TIMESTAMP, server_default='now()')
    updated_at = Column(TIMESTAMP, server_default='now()', onupdate='now()')
    owner = relationship("CarOwner")
    current_location = relationship("Location")

class Location(Base):
    __tablename__ = "Locations"
    location_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    address = Column(String)
    latitude = Column(Numeric)
    longitude = Column(Numeric)
    created_at = Column(TIMESTAMP, server_default='now()')
    updated_at = Column(TIMESTAMP, server_default='now()', onupdate='now()')

class Rental(Base):
    __tablename__ = "Rentals"
    rental_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    car_id = Column(UUID(as_uuid=True), ForeignKey("Cars.car_id"))
    renter_id = Column(UUID(as_uuid=True), ForeignKey("Renters.renter_id"))
    pickup_location_id = Column(UUID(as_uuid=True), ForeignKey("Locations.location_id"))
    start_date = Column(Date)
    end_date = Column(Date)
    total_price = Column(Numeric)
    payment_status = Column(String)
    rental_status = Column(String)
    created_at = Column(TIMESTAMP, server_default='now()')
    updated_at = Column(TIMESTAMP, server_default='now()', onupdate='now()')
    car = relationship("Car")
    renter = relationship("Renter")
    pickup_location = relationship("Location")

class Message(Base):
    __tablename__ = "Messages"
    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rental_id = Column(UUID(as_uuid=True), ForeignKey("Rentals.rental_id"))
    sender_id = Column(UUID(as_uuid=True))
    recipient_id = Column(UUID(as_uuid=True))
    content = Column(Text)
    timestamp = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default='now()')
    updated_at = Column(TIMESTAMP, server_default='now()', onupdate='now()')
    rental = relationship("Rental")
