
import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from server.models.base import Base

class Renter(Base):
    __tablename__ = 'renters'
    renter_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)

class CarOwner(Base):
    __tablename__ = 'car_owners'
    owner_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
