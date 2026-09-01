import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Table,
)
from sqlalchemy.orm import relationship
from server.app.database import Base

# Many-to-Many association table for Property <-> Amenity
property_amenities = Table(
    "property_amenities",
    Base.metadata,
    Column(
        "property_id",
        String(36),
        ForeignKey("properties.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "amenity_id",
        String(36),
        ForeignKey("amenities.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(
        String(50), nullable=False, default="buyer"
    )  # buyer, seller_agent, admin
    phone_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    properties = relationship(
        "Property", back_populates="owner_agent", cascade="all, delete-orphan"
    )
    favorites = relationship(
        "UserFavorite", back_populates="user", cascade="all, delete-orphan"
    )
    saved_searches = relationship(
        "SavedSearch", back_populates="user", cascade="all, delete-orphan"
    )


class Property(Base):
    __tablename__ = "properties"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(
        String(50), nullable=False
    )  # single_family, condo, townhouse
    status = Column(
        String(50), nullable=False, default="Active"
    )  # Active, Pending, Sold
    price = Column(Float, nullable=False)
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Float, nullable=False)
    square_feet = Column(Integer, nullable=False)
    address_street = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(50), nullable=False)
    zip_code = Column(String(20), nullable=False, index=True)
    latitude = Column(Float, nullable=False, default=0.0)
    longitude = Column(Float, nullable=False, default=0.0)
    owner_agent_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    owner_agent = relationship("User", back_populates="properties")
    images = relationship(
        "PropertyImage", back_populates="property", cascade="all, delete-orphan"
    )
    amenities = relationship(
        "Amenity", secondary=property_amenities, back_populates="properties"
    )
    favorited_by = relationship(
        "UserFavorite", back_populates="property", cascade="all, delete-orphan"
    )


class PropertyImage(Base):
    __tablename__ = "property_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    property_id = Column(
        String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False
    )
    image_url = Column(String(512), nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationship
    property = relationship("Property", back_populates="images")


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)

    # Relationship
    properties = relationship(
        "Property", secondary=property_amenities, back_populates="amenities"
    )


class UserFavorite(Base):
    __tablename__ = "user_favorites"

    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    property_id = Column(
        String(36), ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True
    )
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="favorites")
    property = relationship("Property", back_populates="favorited_by")


class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(100), nullable=False)
    filter_criteria = Column(Text, nullable=False)  # JSON string
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationship
    user = relationship("User", back_populates="saved_searches")
