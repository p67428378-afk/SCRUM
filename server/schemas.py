from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID


# --- Portfolio Schemas ---
class DiscographyItemSchema(BaseModel):
    id: UUID
    title: str
    release_year: int
    cover_image_url: Optional[str] = None
    track_count: int

    class Config:
        from_attributes = True


class PortfolioSchema(BaseModel):
    id: UUID
    name: str
    bio: str
    monthly_listeners: int
    hero_image_url: Optional[str] = None
    discography: List[DiscographyItemSchema]

    class Config:
        from_attributes = True


# --- Concert Schemas ---
class ConcertItemSchema(BaseModel):
    id: UUID
    tour_name: str
    event_date: datetime
    status: str
    country: str
    city: str
    venue_name: str
    min_price_local: float
    currency_code: str
    currency_symbol: str

    class Config:
        from_attributes = True


class ConcertListSchema(BaseModel):
    total: int
    items: List[ConcertItemSchema]


class VenueSchema(BaseModel):
    name: str
    city: str
    country: str
    capacity: int

    class Config:
        from_attributes = True


class TicketTierSchema(BaseModel):
    id: UUID
    tier_name: str
    total_capacity: int
    available_seats: int
    price_local: float
    currency_code: str

    class Config:
        from_attributes = True


class ConcertDetailSchema(BaseModel):
    id: UUID
    tour_name: str
    event_date: datetime
    status: str
    venue: VenueSchema
    ticket_tiers: List[TicketTierSchema]

    class Config:
        from_attributes = True


# --- Booking & Reservation Schemas ---
class ReserveRequestSchema(BaseModel):
    concert_id: UUID
    tier_id: UUID
    quantity: int = Field(..., gt=0)
    user_email: EmailStr


class ReserveResponseSchema(BaseModel):
    booking_id: UUID
    booking_reference: str
    concert_id: UUID
    tier_id: UUID
    quantity: int
    total_amount: float
    currency: str
    status: str
    hold_expires_at: datetime
    hold_time_seconds: int


# --- Payment Schemas ---
class CreateIntentRequestSchema(BaseModel):
    booking_id: UUID
    currency: str
    idempotency_key: str


class CreateIntentResponseSchema(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: float
    currency: str
    status: str


class BookRequestSchema(BaseModel):
    booking_id: UUID
    payment_intent_id: str


class BookConcertDetailSchema(BaseModel):
    tour_name: str
    city: str
    venue: str
    event_date: datetime


class DigitalPassSchema(BaseModel):
    qr_code_data: str
    pdf_download_url: str


class BookResponseSchema(BaseModel):
    booking_reference: str
    status: str
    user_email: str
    concert: BookConcertDetailSchema
    digital_pass: DigitalPassSchema


class WebhookResponseSchema(BaseModel):
    status: str
