
import uuid
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from server.models.base import Base

class Rental(Base):
    __tablename__ = 'rentals'
    rental_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    car_id = Column(UUID(as_uuid=True), ForeignKey('cars.car_id'))
    renter_id = Column(UUID(as_uuid=True), ForeignKey('renters.renter_id'))
    pickup_location_id = Column(UUID(as_uuid=True), ForeignKey('locations.location_id'))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    total_price = Column(Numeric)
    payment_status = Column(String)
    rental_status = Column(String)

    car = relationship("Car")
    renter = relationship("Renter")
    pickup_location = relationship("Location")
