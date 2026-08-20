import uuid
from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Float, JSON, DateTime, Index
from server.database import Base


class Region(Base):
    __tablename__ = "regions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, unique=True, index=True)
    capital = Column(String(100), nullable=False, index=True)
    type = Column(
        String(30), nullable=False, index=True
    )  # "state" or "union_territory"
    region = Column(
        String(50), nullable=False
    )  # e.g., "Western India", "Southern India"
    population = Column(BigInteger, nullable=False)
    official_languages = Column(JSON, nullable=False)  # e.g., ["Marathi", "Hindi"]
    iso_code = Column(String(10), nullable=True)
    area_sq_km = Column(Float, nullable=True)
    density_per_sq_km = Column(Float, nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (Index("idx_regions_search", "type", "name", "capital"),)
