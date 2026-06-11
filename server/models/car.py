import uuid
from sqlalchemy import Column, String, Integer, Numeric, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from server.database import Base

class Car(Base):
    __tablename__ = "Cars"

    car_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("CarOwners.owner_id"), nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    vin = Column(String, unique=True, nullable=False)
    license_plate = Column(String, unique=True, nullable=False)
    daily_rate = Column(Numeric, nullable=False)
    status = Column(String, nullable=False)  # e.g., 'available', 'rented', 'maintenance'
    image_urls = Column(Text, nullable=True)  # Stored as comma-separated string for SQLite compatibility
    description = Column(Text, nullable=True)
    current_location_id = Column(String, ForeignKey("Locations.location_id"), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    owner = relationship("CarOwner")
    current_location = relationship("Location")

    def get_image_urls_list(self):
        return self.image_urls.split(',') if self.image_urls else []

    def set_image_urls_list(self, urls):
        self.image_urls = ','.join(urls) if urls else None

    def __repr__(self):
        return f"<Car(car_id='{self.car_id}', make='{self.make}', model='{self.model}')>"
