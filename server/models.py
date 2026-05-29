
import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ARRAY, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
import datetime

Base = declarative_base()

class Renter(Base):
    __tablename__ = "Renters"
    renter_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    rentals = relationship("Rental", back_populates="renter")

class CarOwner(Base):
    __tablename__ = "CarOwners"
    owner_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    cars = relationship("Car", back_populates="owner")

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
    
    owner = relationship("CarOwner", back_populates="cars")
    current_location = relationship("Location", foreign_keys=[current_location_id])
    rentals = relationship("Rental", back_populates="car")

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

    car = relationship("Car", back_populates="rentals")
    renter = relationship("Renter", back_populates="rentals")
    pickup_location = relationship("Location", foreign_keys=[pickup_location_id])
    messages = relationship("Message", back_populates="rental")

class Message(Base):
    __tablename__ = "Messages"
    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rental_id = Column(UUID(as_uuid=True), ForeignKey("Rentals.rental_id"))
    sender_id = Column(UUID(as_uuid=True))
    recipient_id = Column(UUID(as_uuid=True))
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    rental = relationship("Rental", back_populates="messages")
