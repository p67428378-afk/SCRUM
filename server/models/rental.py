
from sqlalchemy import Column, String, TIMESTAMP, Numeric, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from server.models.base import Base

class Rental(Base):
    __tablename__ = "Rentals"
    rental_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    car_id = Column(UUID(as_uuid=True), ForeignKey("Cars.car_id"))
    renter_id = Column(UUID(as_uuid=True), ForeignKey("Renters.renter_id"))
    pickup_location_id = Column(UUID(as_uuid=True), ForeignKey("Locations.location_id"))
    start_date = Column(TIMESTAMP, nullable=False)
    end_date = Column(TIMESTAMP, nullable=False)
    total_price = Column(Numeric, nullable=False)
    payment_status = Column(String, nullable=False)
    rental_status = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    car = relationship("Car")
    renter = relationship("Renter")
    pickup_location = relationship("Location")
