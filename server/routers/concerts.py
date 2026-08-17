from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import ConcertListSchema, ConcertDetailSchema
from server.services.concert_service import get_concerts, get_concert_by_id
from typing import Optional

router = APIRouter(prefix="/api/v1", tags=["concerts"])


@router.get("/concerts", response_model=ConcertListSchema)
def list_concerts(
    country: Optional[str] = Query(None, description="Filter by country"),
    city: Optional[str] = Query(None, description="Filter by city"),
    status: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(
        20, ge=1, le=100, description="Maximum number of items to return"
    ),
    db: Session = Depends(get_db),
):
    # Use status_filter instead of status to avoid shadowing the fastapi.status module
    return get_concerts(
        db, country=country, city=city, status_filter=status, skip=skip, limit=limit
    )


@router.get("/concerts/{concert_id}", response_model=ConcertDetailSchema)
def get_concert(concert_id: str, db: Session = Depends(get_db)):
    return get_concert_by_id(db, concert_id)
