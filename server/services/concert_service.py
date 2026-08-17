from sqlalchemy.orm import Session, joinedload
from server.models import Concert, Venue, Country, TicketTier
from fastapi import HTTPException, status
from typing import Optional


def get_concerts(
    db: Session,
    country: Optional[str] = None,
    city: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
):
    try:
        query = (
            db.query(Concert)
            .join(Venue, Concert.venue_id == Venue.id)
            .join(Country, Venue.country_id == Country.id)
        )

        if country:
            query = query.filter(Country.name.ilike(f"%{country}%"))
        if city:
            query = query.filter(Venue.city.ilike(f"%{city}%"))
        if status_filter:
            query = query.filter(Concert.status.ilike(f"%{status_filter}%"))

        # Order by event date to be deterministic
        query = query.order_by(Concert.event_date.asc())

        total = query.count()
        concerts = query.offset(skip).limit(limit).all()

        items = []
        for concert in concerts:
            venue = concert.venue
            country_obj = venue.country

            # Calculate min_price_local from ticket tiers
            min_price_local = 0.0
            tiers = (
                db.query(TicketTier).filter(TicketTier.concert_id == concert.id).all()
            )
            if tiers:
                min_price_local = min(float(tier.price_local) for tier in tiers)
            else:
                min_price_local = float(concert.min_price_usd)

            items.append(
                {
                    "id": concert.id,
                    "tour_name": concert.tour_name,
                    "event_date": concert.event_date,
                    "status": concert.status,
                    "country": country_obj.name,
                    "city": venue.city,
                    "venue_name": venue.name,
                    "min_price_local": min_price_local,
                    "currency_code": country_obj.currency_code,
                    "currency_symbol": country_obj.currency_symbol,
                }
            )

        return {"total": total, "items": items}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query error: {str(e)}",
        )


def get_concert_by_id(db: Session, concert_id: str):
    concert = (
        db.query(Concert)
        .options(
            joinedload(Concert.venue).joinedload(Venue.country),
            joinedload(Concert.ticket_tiers),
        )
        .filter(Concert.id == concert_id)
        .first()
    )

    if not concert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Concert not found"
        )

    venue = concert.venue
    country = venue.country

    ticket_tiers = []
    for tier in concert.ticket_tiers:
        ticket_tiers.append(
            {
                "id": tier.id,
                "tier_name": tier.tier_name,
                "total_capacity": tier.total_capacity,
                "available_seats": tier.available_seats,
                "price_local": float(tier.price_local),
                "currency_code": tier.currency_code,
            }
        )

    return {
        "id": concert.id,
        "tour_name": concert.tour_name,
        "event_date": concert.event_date,
        "status": concert.status,
        "venue": {
            "name": venue.name,
            "city": venue.city,
            "country": country.name,
            "capacity": venue.capacity,
        },
        "ticket_tiers": ticket_tiers,
    }
