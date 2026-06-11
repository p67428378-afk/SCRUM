import uuid
from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from server.database import Base

class CarOwner(Base):
    __tablename__ = "CarOwners"

    owner_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Optional: Add relationship to Cars if needed later
    # cars = relationship("Car", back_populates="owner")

    def __repr__(self):
        return f"<CarOwner(owner_id='{self.owner_id}', username='{self.username}', email='{self.email}')>"
