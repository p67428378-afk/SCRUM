
import uuid
from sqlalchemy import Column, String, Numeric
from sqlalchemy.dialects.postgresql import UUID
from server.models.base import Base

class Location(Base):
    __tablename__ = 'locations'
    location_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    address = Column(String)
    latitude = Column(Numeric)
    longitude = Column(Numeric)
