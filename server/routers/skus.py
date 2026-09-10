import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import SKU
from server.schemas import SKUCreate, SKUResponse, SKUUpdate

router = APIRouter(prefix="/api/v1/skus", tags=["skus"])


@router.get("", response_model=List[SKUResponse])
def get_skus(
    category: Optional[str] = Query(default=None),
    cluster_id: Optional[str] = Query(default=None),
    is_private_brand: Optional[bool] = Query(default=None),
    status_badge: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(SKU)

    if category:
        query = query.filter(SKU.category.ilike(f"%{category}%"))
    if cluster_id:
        query = query.filter(SKU.cluster_id.ilike(f"%{cluster_id}%"))
    if is_private_brand is not None:
        query = query.filter(SKU.is_private_brand == is_private_brand)
    if status_badge:
        query = query.filter(SKU.status_badge == status_badge.upper())
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (SKU.sku_code.ilike(search_pattern)) | (SKU.product_name.ilike(search_pattern))
        )

    return query.order_by(SKU.sku_code.asc()).all()


@router.get("/{sku_id}", response_model=SKUResponse)
def get_sku_by_id(sku_id: str, db: Session = Depends(get_db)):
    sku = db.query(SKU).filter((SKU.id == sku_id) | (SKU.sku_code == sku_id)).first()
    if not sku:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SKU with ID or code '{sku_id}' not found"
        )
    return sku


@router.post("", response_model=SKUResponse, status_code=status.HTTP_201_CREATED)
def create_sku(payload: SKUCreate, db: Session = Depends(get_db)):
    existing = db.query(SKU).filter(SKU.sku_code == payload.sku_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SKU with code '{payload.sku_code}' already exists"
        )

    sku = SKU(
        id=str(uuid.uuid4()),
        **payload.model_dump()
    )
    db.add(sku)
    db.commit()
    db.refresh(sku)
    return sku


@router.patch("/{sku_id}", response_model=SKUResponse)
def update_sku(sku_id: str, payload: SKUUpdate, db: Session = Depends(get_db)):
    sku = db.query(SKU).filter((SKU.id == sku_id) | (SKU.sku_code == sku_id)).first()
    if not sku:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SKU with ID or code '{sku_id}' not found"
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sku, field, value)

    db.commit()
    db.refresh(sku)
    return sku


@router.delete("/{sku_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sku(sku_id: str, db: Session = Depends(get_db)):
    sku = db.query(SKU).filter((SKU.id == sku_id) | (SKU.sku_code == sku_id)).first()
    if not sku:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SKU with ID or code '{sku_id}' not found"
        )
    db.delete(sku)
    db.commit()
    return None
