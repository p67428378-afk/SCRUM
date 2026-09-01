import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.app.database import get_db
from server.app.models import Property
from server.app.schemas import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
    PriceHistoryListResponse,
)
from server.app.crud.crud_price_history import (
    log_price_change_if_needed,
    get_price_history_for_property,
)

router = APIRouter()


@router.get("", response_model=List[PropertyResponse])
def list_properties(
    city: Optional[str] = None,
    zip_code: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[float] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Property)
    if city:
        query = query.filter(Property.city.ilike(f"%{city}%"))
    if zip_code:
        query = query.filter(Property.zip_code == zip_code)
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
    if max_price is not None:
        query = query.filter(Property.price <= max_price)
    if bedrooms is not None:
        query = query.filter(Property.bedrooms >= bedrooms)
    if bathrooms is not None:
        query = query.filter(Property.bathrooms >= bathrooms)
    if status:
        query = query.filter(Property.status.ilike(status))

    return query.offset(skip).limit(limit).all()


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(property_in: PropertyCreate, db: Session = Depends(get_db)):
    prop_dict = property_in.model_dump()
    prop_id = str(uuid.uuid4())
    prop_dict["id"] = prop_id

    db_property = Property(**prop_dict)
    db.add(db_property)
    db.commit()
    db.refresh(db_property)

    # Automatically log initial listed price
    log_price_change_if_needed(db, db_property, None, db_property.price)
    db.refresh(db_property)

    return db_property


@router.get("/{id}", response_model=PropertyResponse)
def get_property(id: str, db: Session = Depends(get_db)):
    db_property = db.query(Property).filter(Property.id == id).first()
    if not db_property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID '{id}' not found",
        )
    return db_property


@router.put("/{id}", response_model=PropertyResponse)
def update_property(
    id: str, property_in: PropertyUpdate, db: Session = Depends(get_db)
):
    db_property = db.query(Property).filter(Property.id == id).first()
    if not db_property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID '{id}' not found",
        )

    old_price = db_property.price
    update_data = property_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_property, field, value)

    db.commit()
    db.refresh(db_property)

    # Check if price was updated and log history entry
    if (
        "price" in update_data
        and update_data["price"] is not None
        and update_data["price"] != old_price
    ):
        log_price_change_if_needed(db, db_property, old_price, db_property.price)
        db.refresh(db_property)

    return db_property


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(id: str, db: Session = Depends(get_db)):
    db_property = db.query(Property).filter(Property.id == id).first()
    if not db_property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID '{id}' not found",
        )
    db.delete(db_property)
    db.commit()
    return None


@router.get("/{id}/price-history", response_model=PriceHistoryListResponse)
def get_property_price_history(id: str, db: Session = Depends(get_db)):
    db_property = db.query(Property).filter(Property.id == id).first()
    if not db_property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID '{id}' not found",
        )
    history = get_price_history_for_property(db, id)
    return PriceHistoryListResponse(property_id=id, history=history)
