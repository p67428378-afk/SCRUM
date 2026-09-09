import uuid
from datetime import date, timedelta, datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.app.models.drug import Drug
from server.app.schemas.drug import DrugCreate, DrugUpdate, DrugResponse

LOW_STOCK_THRESHOLD = 50
NEAR_EXPIRY_DAYS = 30


def compute_alert_flags(
    stock_quantity: int, expiration_date: date
) -> Tuple[bool, bool]:
    is_low_stock = stock_quantity < LOW_STOCK_THRESHOLD
    today = date.today()
    expiry_limit = today + timedelta(days=NEAR_EXPIRY_DAYS)
    is_near_expiry = expiration_date <= expiry_limit
    return is_low_stock, is_near_expiry


def drug_to_response(drug: Drug) -> DrugResponse:
    is_low_stock, is_near_expiry = compute_alert_flags(
        drug.stock_quantity, drug.expiration_date
    )
    return DrugResponse(
        id=drug.id,
        name=drug.name,
        generic_name=drug.generic_name,
        dosage=drug.dosage,
        manufacturer=drug.manufacturer,
        batch_number=drug.batch_number,
        stock_quantity=drug.stock_quantity,
        expiration_date=drug.expiration_date,
        category=drug.category,
        unit_price=float(drug.unit_price),
        is_low_stock=is_low_stock,
        is_near_expiry=is_near_expiry,
        created_at=drug.created_at,
        updated_at=drug.updated_at,
    )


def get_drugs(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category: Optional[str] = None,
) -> Tuple[List[DrugResponse], int, int, int]:
    query = db.query(Drug)

    if category:
        query = query.filter(Drug.category.ilike(f"%{category}%"))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Drug.name.ilike(search_pattern),
                Drug.generic_name.ilike(search_pattern),
                Drug.manufacturer.ilike(search_pattern),
                Drug.batch_number.ilike(search_pattern),
                Drug.category.ilike(search_pattern),
            )
        )

    total = query.count()
    drugs = query.order_by(Drug.created_at.desc()).offset(skip).limit(limit).all()

    items = [drug_to_response(d) for d in drugs]

    # Calculate global alert counts across all drugs in database
    today = date.today()
    expiry_limit = today + timedelta(days=NEAR_EXPIRY_DAYS)

    low_stock_count = (
        db.query(Drug).filter(Drug.stock_quantity < LOW_STOCK_THRESHOLD).count()
    )
    near_expiry_count = (
        db.query(Drug).filter(Drug.expiration_date <= expiry_limit).count()
    )

    return items, total, low_stock_count, near_expiry_count


def get_drug_by_id(db: Session, drug_id: str) -> Optional[DrugResponse]:
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        return None
    return drug_to_response(drug)


def create_drug(db: Session, drug_in: DrugCreate) -> DrugResponse:
    drug_data = drug_in.model_dump()
    drug = Drug(id=str(uuid.uuid4()), **drug_data)
    db.add(drug)
    db.commit()
    db.refresh(drug)
    return drug_to_response(drug)


def update_drug(
    db: Session, drug_id: str, drug_in: DrugUpdate
) -> Optional[DrugResponse]:
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        return None

    update_data = drug_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(drug, field, value)

    drug.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(drug)
    return drug_to_response(drug)


def delete_drug(db: Session, drug_id: str) -> bool:
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        return False
    db.delete(drug)
    db.commit()
    return True
