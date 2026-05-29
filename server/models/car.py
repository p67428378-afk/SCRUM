
from sqlalchemy import Column, String, Integer, Numeric, ARRAY, Text, TIMESTAMP, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from server.models.base import Base

class Car(Base):
    __tablename__ = "Cars"
    car_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("CarOwners.owner_id"))
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    vin = Column(String, nullable=False, unique=True)
    license_plate = Column(String, nullable=False, unique=True)
    daily_rate = Column(Numeric, nullable=False)
    status = Column(String, nullable=False)
    image_urls = Column(ARRAY(String))
    description = Column(Text)
    current_location_id = Column(UUID(as_uuid=True), ForeignKey("Locations.location_id"))
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    owner = relationship("CarOwner")
    current_location = relationship("Location")
