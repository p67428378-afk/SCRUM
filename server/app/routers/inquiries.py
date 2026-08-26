from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.app.db.session import get_db
from server.app.models.user import User
from server.app.models.listing import DogListing
from server.app.models.inquiry import Inquiry
from server.app.schemas.inquiry import InquiryResponse
from server.app.core.security import get_current_user

router = APIRouter()


@router.get("", response_model=List[InquiryResponse])
def get_inquiries(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        inquiries = (
            db.query(Inquiry)
            .order_by(Inquiry.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    else:
        inquiries = (
            db.query(Inquiry)
            .join(DogListing, Inquiry.listing_id == DogListing.id)
            .filter(
                or_(
                    DogListing.seller_id == current_user.id,
                    Inquiry.buyer_id == current_user.id,
                    Inquiry.buyer_email == current_user.email,
                )
            )
            .order_by(Inquiry.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    return inquiries
