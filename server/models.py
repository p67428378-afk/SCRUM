import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    Numeric,
    CHAR,
)
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from server.database import Base


class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise CHAR(36), keeping as string.
    """

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            return value


def get_utc_now():
    return datetime.now(timezone.utc)


class Artist(Base):
    __tablename__ = "artists"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    bio = Column(Text, nullable=False)
    monthly_listeners = Column(Integer, default=0)
    hero_image_url = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    discography = relationship(
        "Discography", back_populates="artist", cascade="all, delete-orphan"
    )
    concerts = relationship(
        "Concert", back_populates="artist", cascade="all, delete-orphan"
    )


class Discography(Base):
    __tablename__ = "discography"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    artist_id = Column(GUID, ForeignKey("artists.id"), nullable=False)
    title = Column(String(255), nullable=False)
    release_year = Column(Integer, nullable=False)
    cover_image_url = Column(String(512), nullable=True)
    track_count = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)

    artist = relationship("Artist", back_populates="discography")


class Country(Base):
    __tablename__ = "countries"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(10), nullable=False, unique=True)
    currency_code = Column(String(3), nullable=False)
    currency_symbol = Column(String(10), nullable=False)

    venues = relationship(
        "Venue", back_populates="country", cascade="all, delete-orphan"
    )


class Venue(Base):
    __tablename__ = "venues"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    country_id = Column(GUID, ForeignKey("countries.id"), nullable=False)
    name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)

    country = relationship("Country", back_populates="venues")
    concerts = relationship(
        "Concert", back_populates="venue", cascade="all, delete-orphan"
    )


class Concert(Base):
    __tablename__ = "concerts"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    artist_id = Column(GUID, ForeignKey("artists.id"), nullable=False)
    venue_id = Column(GUID, ForeignKey("venues.id"), nullable=False)
    tour_name = Column(String(255), nullable=False)
    event_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), nullable=False, default="On Sale")
    min_price_usd = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)

    artist = relationship("Artist", back_populates="concerts")
    venue = relationship("Venue", back_populates="concerts")
    ticket_tiers = relationship(
        "TicketTier", back_populates="concert", cascade="all, delete-orphan"
    )
    bookings = relationship(
        "Booking", back_populates="concert", cascade="all, delete-orphan"
    )


class TicketTier(Base):
    __tablename__ = "ticket_tiers"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    concert_id = Column(GUID, ForeignKey("concerts.id"), nullable=False)
    tier_name = Column(String(100), nullable=False)
    total_capacity = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    price_local = Column(Numeric(10, 2), nullable=False)
    currency_code = Column(String(3), nullable=False)

    concert = relationship("Concert", back_populates="ticket_tiers")
    bookings = relationship(
        "Booking", back_populates="tier", cascade="all, delete-orphan"
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_email = Column(String(255), nullable=False)
    concert_id = Column(GUID, ForeignKey("concerts.id"), nullable=False)
    tier_id = Column(GUID, ForeignKey("ticket_tiers.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    status = Column(String(50), nullable=False, default="RESERVED")
    hold_expires_at = Column(DateTime(timezone=True), nullable=False)
    booking_reference = Column(String(20), nullable=False, unique=True)
    idempotency_key = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)

    concert = relationship("Concert", back_populates="bookings")
    tier = relationship("TicketTier", back_populates="bookings")
    payment = relationship(
        "Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan"
    )
    digital_ticket = relationship(
        "DigitalTicket",
        back_populates="booking",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Payment(Base):
    __tablename__ = "payments"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    booking_id = Column(GUID, ForeignKey("bookings.id"), nullable=False)
    stripe_payment_intent_id = Column(String(255), nullable=False, unique=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    status = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)

    booking = relationship("Booking", back_populates="payment")


class DigitalTicket(Base):
    __tablename__ = "digital_tickets"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    booking_id = Column(GUID, ForeignKey("bookings.id"), nullable=False)
    qr_code_data = Column(Text, nullable=False)
    pdf_url = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)

    booking = relationship("Booking", back_populates="digital_ticket")
