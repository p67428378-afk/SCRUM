import uuid
from sqlalchemy import Column, String, Numeric, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from server.database import Base

class Rental(Base):
    __tablename__ = "Rentals"

    rental_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    car_id = Column(String, ForeignKey("Cars.car_id"), nullable=False)
    renter_id = Column(String, ForeignKey("Renters.renter_id"), nullable=False)
    pickup_location_id = Column(String, ForeignKey("Locations.location_id"), nullable=False)
    start_date = Column(TIMESTAMP(timezone=True), nullable=False)
    end_date = Column(TIMESTAMP(timezone=True), nullable=False)
    total_price = Column(Numeric, nullable=False)
    payment_status = Column(String, nullable=False) # e.g., 'pending', 'paid', 'failed'
    rental_status = Column(String, nullable=False)  # e.g., 'booked', 'active', 'completed', 'cancelled'
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    car = relationship("Car")
    renter = relationship("Renter")
    pickup_location = relationship("Location")

    def __repr__(self):
        return f"<Rental(rental_id='{self.rental_id}', car_id='{self.car_id}', renter_id='{self.renter_id}')>"
