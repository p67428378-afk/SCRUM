"""
Module: locations
Purpose: Router for location management endpoints.
Author: Backend Developer Agent
Created: 2026-06-19
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from server.database import get_db
from server.models import Location
from server.schemas import LocationCreate, LocationResponse, LocationDefaultResponse, DeleteResponse

router = APIRouter(prefix="/api/v1/locations", tags=["locations"])

@router.get("", response_model=List[LocationResponse])
def get_locations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max number of records to return"),
    db: Session = Depends(get_db)
):
    """Get list of saved locations for the user."""
    locations = (
        db.query(Location)
        .order_by(Location.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return locations

@router.post("", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(
    location_in: LocationCreate,
    db: Session = Depends(get_db)
):
    """Save a new location."""
    normalized_name = location_in.name.strip().title()
    
    # Check if location already exists
    existing = db.query(Location).filter(Location.name == normalized_name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location already saved"
        )
        
    # If this is set as default, unset other defaults
    if location_in.is_default:
        db.query(Location).update({Location.is_default: False})
        
    new_location = Location(
        name=normalized_name,
        country=location_in.country.strip().upper() if location_in.country else None,
        is_default=location_in.is_default
    )
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location

@router.delete("/{id}", response_model=DeleteResponse)
def delete_location(
    id: str,
    db: Session = Depends(get_db)
):
    """Delete a saved location."""
    location = db.query(Location).filter(Location.id == id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location ID not found"
        )
    db.delete(location)
    db.commit()
    return {"success": True}

@router.put("/{id}/default", response_model=LocationDefaultResponse)
def set_default_location(
    id: str,
    db: Session = Depends(get_db)
):
    """Set a saved location as default."""
    location = db.query(Location).filter(Location.id == id).first()
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location ID not found"
        )
        
    # Unset all other defaults
    db.query(Location).update({Location.is_default: False})
    
    # Set this one as default
    location.is_default = True
    db.commit()
    db.refresh(location)
    return location
