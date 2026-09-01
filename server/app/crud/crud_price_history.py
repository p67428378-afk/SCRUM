import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from server.app.models import PropertyPriceHistory, Property


def create_price_history_entry(
    db: Session, property_id: str, price: float, change_event: str
) -> PropertyPriceHistory:
    history_entry = PropertyPriceHistory(
        id=str(uuid.uuid4()),
        property_id=property_id,
        price=price,
        change_event=change_event,
        recorded_at=datetime.utcnow(),
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)
    return history_entry


def get_price_history_for_property(
    db: Session, property_id: str
) -> List[PropertyPriceHistory]:
    return (
        db.query(PropertyPriceHistory)
        .filter(PropertyPriceHistory.property_id == property_id)
        .order_by(PropertyPriceHistory.recorded_at.asc())
        .all()
    )


def log_price_change_if_needed(
    db: Session, property_obj: Property, old_price: Optional[float], new_price: float
):
    if old_price is None:
        create_price_history_entry(db, property_obj.id, new_price, "listed")
    elif new_price < old_price:
        create_price_history_entry(db, property_obj.id, new_price, "price_drop")
    elif new_price > old_price:
        create_price_history_entry(db, property_obj.id, new_price, "price_increase")
