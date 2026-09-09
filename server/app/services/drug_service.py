from datetime import date, timedelta
from typing import Tuple, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.drug import Drug
from app.schemas.drug import DrugCreate, DrugUpdate

LOW_STOCK_THRESHOLD = 50
NEAR_EXPIRY_DAYS = 30


def compute_alert_flags(
    stock_quantity: int, expiration_date: date
) -> Tuple[bool, bool]:
    today = date.today()
    is_low = stock_quantity < LOW_STOCK_THRESHOLD
    is_near_exp = expiration_date <= (today + timedelta(days=NEAR_EXPIRY_DAYS))
    return is_low, is_near_exp


def to_drug_response_dict(drug: Drug) -> dict:
    is_low, is_near_exp = compute_alert_flags(drug.stock_quantity, drug.expiration_date)
    return {
        "id": drug.id,
        "name": drug.name,
        "generic_name": drug.generic_name,
        "dosage": drug.dosage,
        "manufacturer": drug.manufacturer,
        "batch_number": drug.batch_number,
        "stock_quantity": drug.stock_quantity,
        "expiration_date": drug.expiration_date,
        "category": drug.category,
        "unit_price": drug.unit_price,
        "is_low_stock": is_low,
        "is_near_expiry": is_near_exp,
        "created_at": drug.created_at,
        "updated_at": drug.updated_at,
    }


def get_drugs(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category: Optional[str] = None,
    is_low_stock: Optional[bool] = None,
    is_near_expiry: Optional[bool] = None,
) -> Tuple[List[dict], int, int, int]:
    query = db.query(Drug)

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

    if category:
        query = query.filter(Drug.category.ilike(category))

    all_matching = query.all()

    today = date.today()
    expiry_limit = today + timedelta(days=NEAR_EXPIRY_DAYS)

    filtered_items = []
    low_stock_count = 0
    near_expiry_count = 0

    for item in all_matching:
        is_low = item.stock_quantity < LOW_STOCK_THRESHOLD
        is_near_exp = item.expiration_date <= expiry_limit

        if is_low:
            low_stock_count += 1
        if is_near_exp:
            near_expiry_count += 1

        if is_low_stock is not None and is_low != is_low_stock:
            continue
        if is_near_expiry is not None and is_near_exp != is_near_expiry:
            continue

        filtered_items.append(item)

    total = len(filtered_items)
    paginated_items = filtered_items[skip : skip + limit]
    response_items = [to_drug_response_dict(item) for item in paginated_items]

    return response_items, total, low_stock_count, near_expiry_count


def get_drug_by_id(db: Session, drug_id: str) -> Optional[dict]:
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        return None
    return to_drug_response_dict(drug)


def create_drug(db: Session, drug_in: DrugCreate) -> dict:
    drug = Drug(
        name=drug_in.name,
        generic_name=drug_in.generic_name,
        dosage=drug_in.dosage,
        manufacturer=drug_in.manufacturer,
        batch_number=drug_in.batch_number,
        stock_quantity=drug_in.stock_quantity,
        expiration_date=drug_in.expiration_date,
        category=drug_in.category,
        unit_price=drug_in.unit_price,
    )
    db.add(drug)
    db.commit()
    db.refresh(drug)
    return to_drug_response_dict(drug)


def update_drug(db: Session, drug_id: str, drug_in: DrugUpdate) -> Optional[dict]:
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        return None

    update_data = drug_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(drug, field, value)

    db.commit()
    db.refresh(drug)
    return to_drug_response_dict(drug)


def delete_drug(db: Session, drug_id: str) -> bool:
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        return False
    db.delete(drug)
    db.commit()
    return True
