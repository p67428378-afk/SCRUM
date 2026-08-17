from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import (
    CreateIntentRequestSchema,
    CreateIntentResponseSchema,
    WebhookResponseSchema,
)
from server.services.payment_service import create_payment_intent, handle_stripe_webhook

router = APIRouter(prefix="/api/v1", tags=["payments"])


@router.post(
    "/payments/create-intent",
    response_model=CreateIntentResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_intent(payload: CreateIntentRequestSchema, db: Session = Depends(get_db)):
    return create_payment_intent(
        db,
        booking_id=str(payload.booking_id),
        currency=payload.currency,
        idempotency_key=payload.idempotency_key,
    )


@router.post(
    "/payments/webhook",
    response_model=WebhookResponseSchema,
    status_code=status.HTTP_200_OK,
)
async def webhook(request: Request, db: Session = Depends(get_db)):
    try:
        payload = await request.json()
    except Exception:
        payload = {}
    return handle_stripe_webhook(db, payload)
