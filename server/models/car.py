
import uuid
from sqlalchemy import Column, String, Integer, Numeric, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from server.models.base import Base

class Car(Base):
    __tablename__ = 'cars'
    car_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey('car_owners.owner_id'))
    make = Column(String)
    model = Column(String)
    year = Column(Integer)
    vin = Column(String, unique=True)
    license_plate = Column(String, unique=True)
    daily_rate = Column(Numeric)
    status = Column(String)
    image_urls = Column(String) # Store as JSON string
    description = Column(Text)
    current_location_id = Column(UUID(as_uuid=True), ForeignKey('locations.location_id'))

    owner = relationship("CarOwner")
    current_location = relationship("Location")
