import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from server.models import Booking, TicketTier, Concert, Venue, DigitalTicket, Payment
from server.redis_client import get_redis
from fastapi import HTTPException, status

redis_client = get_redis()


def ensure_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def release_expired_bookings(db: Session):
    now = datetime.now(timezone.utc)
    # In SQLite, we can compare with naive datetime or let SQLite handle it.
    # To be safe, let's fetch all RESERVED bookings and check in Python, or let SQL do it.
    # Let's let SQL do it, but also double check in Python if needed.
    expired_bookings = db.query(Booking).filter(Booking.status == "RESERVED").all()
    updated = False
    for booking in expired_bookings:
        if ensure_utc(booking.hold_expires_at) < now:
            booking.status = "EXPIRED"
            tier = db.query(TicketTier).filter(TicketTier.id == booking.tier_id).first()
            if tier:
                tier.available_seats += booking.quantity
            updated = True
    if updated:
        db.commit()


def reserve_tickets(
    db: Session, concert_id: str, tier_id: str, quantity: int, user_email: str
):
    # 1. Release any expired bookings first to free up seats
    release_expired_bookings(db)

    # 2. Acquire a lock in Redis to prevent concurrent reservation contention
    lock_key = f"lock:tier:{tier_id}"
    # In our InMemoryRedis, set returns True. If it's already locked, we can simulate contention.
    # To make it robust, let's check if the lock exists.
    if redis_client.get(lock_key):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Seat lock contention"
        )

    redis_client.set(lock_key, "locked", ex=5)  # 5-second lock

    try:
        # 3. Check if concert and tier exist
        concert = db.query(Concert).filter(Concert.id == concert_id).first()
        if not concert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Concert not found"
            )

        tier = (
            db.query(TicketTier)
            .filter(TicketTier.id == tier_id, TicketTier.concert_id == concert_id)
            .first()
        )
        if not tier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Ticket tier not found"
            )

        # 4. Check seat availability
        if tier.available_seats < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient ticket availability",
            )

        # 5. Create reservation
        hold_time_seconds = 600  # 10 minutes
        hold_expires_at = datetime.now(timezone.utc) + timedelta(
            seconds=hold_time_seconds
        )
        booking_reference = f"BK-{uuid.uuid4().hex[:8].upper()}"
        idempotency_key = str(uuid.uuid4())
        total_amount = float(tier.price_local) * quantity

        booking = Booking(
            id=uuid.uuid4(),
            user_email=user_email,
            concert_id=concert.id,
            tier_id=tier.id,
            quantity=quantity,
            total_amount=total_amount,
            currency=tier.currency_code,
            status="RESERVED",
            hold_expires_at=hold_expires_at,
            booking_reference=booking_reference,
            idempotency_key=idempotency_key,
            created_at=datetime.now(timezone.utc),
        )

        # Deduct available seats
        tier.available_seats -= quantity

        db.add(booking)
        db.commit()
        db.refresh(booking)

        return {
            "booking_id": booking.id,
            "booking_reference": booking.booking_reference,
            "concert_id": booking.concert_id,
            "tier_id": booking.tier_id,
            "quantity": booking.quantity,
            "total_amount": float(booking.total_amount),
            "currency": booking.currency,
            "status": booking.status,
            "hold_expires_at": booking.hold_expires_at,
            "hold_time_seconds": hold_time_seconds,
        }
    finally:
        redis_client.delete(lock_key)


def book_tickets(db: Session, booking_id: str, payment_intent_id: str):
    # Release expired bookings first
    release_expired_bookings(db)

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Booking reference not found"
        )

    if booking.status == "EXPIRED" or ensure_utc(
        booking.hold_expires_at
    ) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment not confirmed or hold lock expired",
        )

    if booking.status == "CONFIRMED":
        # Already booked, return details (idempotent)
        pass
    else:
        booking.status = "CONFIRMED"

        # Create payment record
        payment = Payment(
            id=uuid.uuid4(),
            booking_id=booking.id,
            stripe_payment_intent_id=payment_intent_id,
            amount=booking.total_amount,
            currency=booking.currency,
            status="SUCCESS",
            created_at=datetime.now(timezone.utc),
        )
        db.add(payment)

        # Create digital ticket
        qr_code_data = f"TICKET-{booking.booking_reference}-{booking.user_email}"
        pdf_url = f"https://tickets.example.com/pdf/{booking.booking_reference}"
        digital_ticket = DigitalTicket(
            id=uuid.uuid4(),
            booking_id=booking.id,
            qr_code_data=qr_code_data,
            pdf_url=pdf_url,
            created_at=datetime.now(timezone.utc),
        )
        db.add(digital_ticket)
        db.commit()

    concert = db.query(Concert).filter(Concert.id == booking.concert_id).first()
    venue = db.query(Venue).filter(Venue.id == concert.venue_id).first()

    return {
        "booking_reference": booking.booking_reference,
        "status": booking.status,
        "user_email": booking.user_email,
        "concert": {
            "tour_name": concert.tour_name,
            "city": venue.city,
            "venue": venue.name,
            "event_date": concert.event_date,
        },
        "digital_pass": {
            "qr_code_data": f"TICKET-{booking.booking_reference}-{booking.user_email}",
            "pdf_download_url": f"https://tickets.example.com/pdf/{booking.booking_reference}",
        },
    }
