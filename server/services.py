from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from server.models import Credit, MediaAsset, ContactInquiry
from server.schemas import ContactInquiryCreate


def get_credits(
    db: Session, category: Optional[str] = None, skip: int = 0, limit: int = 50
) -> Tuple[int, List[Credit]]:
    query = db.query(Credit)
    if category:
        query = query.filter(Credit.category.ilike(category))
    total = query.count()
    credits = (
        query.order_by(Credit.release_year.desc().nullslast())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return total, credits


def get_gallery_assets(
    db: Session, media_type: Optional[str] = None, skip: int = 0, limit: int = 20
) -> Tuple[int, List[MediaAsset]]:
    query = db.query(MediaAsset)
    if media_type:
        query = query.filter(MediaAsset.media_type.ilike(media_type))
    total = query.count()
    assets = (
        query.order_by(MediaAsset.display_order.asc(), MediaAsset.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return total, assets


def create_contact_inquiry(
    db: Session, inquiry_in: ContactInquiryCreate
) -> ContactInquiry:
    inquiry = ContactInquiry(
        sender_name=inquiry_in.sender_name,
        sender_email=inquiry_in.sender_email,
        project_type=inquiry_in.project_type,
        budget=inquiry_in.budget,
        project_dates=inquiry_in.project_dates,
        message=inquiry_in.message,
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry
