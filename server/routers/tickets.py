from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import (
    ReserveRequestSchema,
    ReserveResponseSchema,
    BookRequestSchema,
    BookResponseSchema,
)
from server.services.booking_service import reserve_tickets, book_tickets

router = APIRouter(prefix="/api/v1", tags=["tickets"])


@router.post(
    "/tickets/reserve",
    response_model=ReserveResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def reserve(payload: ReserveRequestSchema, db: Session = Depends(get_db)):
    return reserve_tickets(
        db,
        concert_id=str(payload.concert_id),
        tier_id=str(payload.tier_id),
        quantity=payload.quantity,
        user_email=payload.user_email,
    )


@router.post(
    "/tickets/book", response_model=BookResponseSchema, status_code=status.HTTP_200_OK
)
def book(payload: BookRequestSchema, db: Session = Depends(get_db)):
    return book_tickets(
        db,
        booking_id=str(payload.booking_id),
        payment_intent_id=payload.payment_intent_id,
    )
