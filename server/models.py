from sqlalchemy import Column, Integer, String, Float, DateTime, ARRAY, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .database import Base

class Renter(Base):
    __tablename__ = "Renters"
    renter_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

class CarOwner(Base):
    __tablename__ = "CarOwners"
    owner_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

class Car(Base):
    __tablename__ = "Cars"
    car_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("CarOwners.owner_id"))
    make = Column(String)
    model = Column(String)
    year = Column(Integer)
    daily_rate = Column(Float)
    status = Column(String)
    image_urls = Column(ARRAY(String))
    description = Column(String)
    vin = Column(String)
    license_plate = Column(String)
    current_location_id = Column(UUID(as_uuid=True), ForeignKey("Locations.location_id"))

class Location(Base):
    __tablename__ = "Locations"
    location_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    address = Column(String)

class Rental(Base):
    __tablename__ = "Rentals"
    rental_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    car_id = Column(UUID(as_uuid=True), ForeignKey("Cars.car_id"))
    renter_id = Column(UUID(as_uuid=True), ForeignKey("Renters.renter_id"))
    pickup_location_id = Column(UUID(as_uuid=True), ForeignKey("Locations.location_id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    total_price = Column(Float)
    payment_status = Column(String)
    rental_status = Column(String)

class Message(Base):
    __tablename__ = "Messages"
    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rental_id = Column(UUID(as_uuid=True), ForeignKey("Rentals.rental_id"))
    sender_id = Column(UUID(as_uuid=True))
    recipient_id = Column(UUID(as_uuid=True))
    content = Column(String)
    timestamp = Column(DateTime)
