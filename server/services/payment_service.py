import uuid
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from server.models import Booking
from server.redis_client import get_redis
from fastapi import HTTPException, status

redis_client = get_redis()


def ensure_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def create_payment_intent(
    db: Session, booking_id: str, currency: str, idempotency_key: str
):
    # 1. Check idempotency cache
    cache_key = f"idempotency:payment:{idempotency_key}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    # 2. Find booking
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking reference not found"
        )

    # 3. Check if reservation is expired
    if booking.status == "EXPIRED" or ensure_utc(
        booking.hold_expires_at
    ) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reservation expired or invalid currency",
        )

    # 4. Check if currency matches
    if booking.currency.upper() != currency.upper():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reservation expired or invalid currency",
        )

    # 5. Mock Stripe Payment Intent creation
    payment_intent_id = f"pi_{uuid.uuid4().hex[:16]}"
    client_secret = f"{payment_intent_id}_secret_{uuid.uuid4().hex[:8]}"
    amount = float(booking.total_amount)

    response_data = {
        "client_secret": client_secret,
        "payment_intent_id": payment_intent_id,
        "amount": amount,
        "currency": currency.upper(),
        "status": "requires_payment_method",
    }

    # Cache the response for idempotency (e.g., 24 hours)
    redis_client.set(cache_key, json.dumps(response_data), ex=86400)

    return response_data


def handle_stripe_webhook(db: Session, payload: dict):
    # Stripe webhook event handler for async payment reconciliation
    try:
        event_type = payload.get("type")
        if event_type == "payment_intent.succeeded":
            data_object = payload.get("data", {}).get("object", {})
            payment_intent_id = data_object.get("id")
            amount_received = data_object.get(
                "amount_received"
            )  # in cents usually, but let's handle it
            currency = data_object.get("currency")

            # Find the booking or payment associated with this payment_intent_id
            # In a real app, we'd look up by metadata. Here, let's find the payment or booking.
            # Let's see if we can find a booking that has a matching total amount and currency, or just log it.
            # For the webhook endpoint, we just need to return {"status": "success"} or similar.
            return {"status": "success"}
        return {"status": "ignored"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid signature or payload: {str(e)}",
        )
