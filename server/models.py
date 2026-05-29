from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from server.database import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID

class Renter(Base):
    __tablename__ = "renters"
    renter_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    rentals = relationship("Rental", back_populates="renter")

class CarOwner(Base):
    __tablename__ = "car_owners"
    owner_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    cars = relationship("Car", back_populates="owner")

class Car(Base):
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
    owner = relationship("CarOwner", back_populates="cars")
    location = relationship("Location")
    rentals = relationship("Rental", back_populates="car")

class Location(Base):
    __tablename__ = "locations"
    location_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    address = Column(String, nullable=False)

class Rental(Base):
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
    car = relationship("Car", back_populates="rentals")
    renter = relationship("Renter", back_populates="rentals")
    pickup_location = relationship("Location")
    messages = relationship("Message", back_populates="rental")

class Message(Base):
    __tablename__ = "messages"
    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rental_id = Column(UUID(as_uuid=True), ForeignKey("rentals.rental_id"))
    sender_id = Column(UUID(as_uuid=True), nullable=False)
    recipient_id = Column(UUID(as_uuid=True), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    rental = relationship("Rental", back_populates="messages")