from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.app.db.session import get_db
from server.app.models.user import User
from server.app.models.listing import DogListing
from server.app.models.inquiry import Inquiry
from server.app.schemas.listing import (
    DogListingCreate,
    DogListingUpdate,
    DogListingResponse,
)
from server.app.schemas.inquiry import InquiryCreate, InquiryResponse
from server.app.core.security import get_current_user, get_current_user_optional

router = APIRouter()


@router.get("", response_model=List[DogListingResponse])
def get_listings(
    breed: Optional[str] = Query(None, description="Filter by breed"),
    min_age: Optional[int] = Query(None, description="Minimum age in months"),
    max_age: Optional[int] = Query(None, description="Maximum age in months"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    location: Optional[str] = Query(None, description="Filter by location"),
    min_rating: Optional[float] = Query(None, description="Minimum seller rating"),
    search: Optional[str] = Query(
        None, description="Search term for title, breed, location, description"
    ),
    q: Optional[str] = Query(None, description="Alias for search term"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(DogListing)

    if min_rating is not None:
        query = query.join(User, DogListing.seller_id == User.id).filter(
            User.seller_rating >= min_rating
        )

    if breed:
        query = query.filter(DogListing.breed.ilike(f"%{breed}%"))

    if min_age is not None:
        query = query.filter(DogListing.age_months >= min_age)

    if max_age is not None:
        query = query.filter(DogListing.age_months <= max_age)

    if min_price is not None:
        query = query.filter(DogListing.price >= min_price)

    if max_price is not None:
        query = query.filter(DogListing.price <= max_price)

    if location:
        query = query.filter(DogListing.location.ilike(f"%{location}%"))

    search_term = search or q
    if search_term:
        term = f"%{search_term}%"
        query = query.filter(
            or_(
                DogListing.title.ilike(term),
                DogListing.breed.ilike(term),
                DogListing.location.ilike(term),
                DogListing.description.ilike(term),
            )
        )

    listings = (
        query.order_by(DogListing.created_at.desc()).offset(skip).limit(limit).all()
    )
    return listings


@router.post("", response_model=DogListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: DogListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = DogListing(
        seller_id=current_user.id,
        title=listing_in.title,
        breed=listing_in.breed,
        age_months=listing_in.age_months,
        price=listing_in.price,
        location=listing_in.location,
        description=listing_in.description,
        health_records=listing_in.health_records,
        photo_urls=listing_in.photo_urls or [],
        status=listing_in.status or "available",
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@router.get("/{id}", response_model=DogListingResponse)
def get_listing(id: str, db: Session = Depends(get_db)):
    listing = db.query(DogListing).filter(DogListing.id == id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dog listing with ID {id} not found.",
        )
    return listing


@router.put("/{id}", response_model=DogListingResponse)
def update_listing(
    id: str,
    listing_in: DogListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = db.query(DogListing).filter(DogListing.id == id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dog listing with ID {id} not found.",
        )

    if listing.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this listing.",
        )

    update_data = listing_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return listing


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = db.query(DogListing).filter(DogListing.id == id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dog listing with ID {id} not found.",
        )

    if listing.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this listing.",
        )

    db.delete(listing)
    db.commit()
    return None


@router.post(
    "/{id}/inquire", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED
)
def submit_inquiry(
    id: str,
    inquiry_in: InquiryCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    listing = db.query(DogListing).filter(DogListing.id == id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dog listing with ID {id} not found.",
        )

    inquiry = Inquiry(
        listing_id=listing.id,
        buyer_id=current_user.id if current_user else None,
        buyer_name=inquiry_in.buyer_name,
        buyer_email=inquiry_in.buyer_email,
        buyer_phone=inquiry_in.buyer_phone,
        message=inquiry_in.message,
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    # Trigger contact notification log to seller
    print(
        f"[NOTIFICATION] Inquiry sent to seller ({listing.seller_id}) for listing '{listing.title}' from {inquiry.buyer_email}"
    )

    return inquiry
