from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.app.database import get_db
from server.app import models, schemas
from server.app.auth.utils import get_current_user

router = APIRouter(prefix="/api/v1/favorites", tags=["favorites"])


@router.get("", response_model=List[schemas.PropertyResponse])
def get_favorites(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    favs = (
        db.query(models.UserFavorite)
        .filter(models.UserFavorite.user_id == current_user.id)
        .all()
    )
    properties = []
    for fav in favs:
        if fav.property:
            p_res = (
                schemas.PropertyResponse.model_validate(fav.property)
                if hasattr(schemas.PropertyResponse, "model_validate")
                else schemas.PropertyResponse.from_orm(fav.property)
            )
            p_res.is_favorite = True
            properties.append(p_res)
    return properties


@router.post("/{property_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Verify property exists
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Property not found"
        )

    existing_fav = (
        db.query(models.UserFavorite)
        .filter(
            models.UserFavorite.user_id == current_user.id,
            models.UserFavorite.property_id == property_id,
        )
        .first()
    )

    if not existing_fav:
        fav = models.UserFavorite(
            user_id=current_user.id,
            property_id=property_id,
            created_at=datetime.utcnow(),
        )
        db.add(fav)
        db.commit()

    return {"message": "Property added to favorites", "property_id": property_id}


@router.delete("/{property_id}", status_code=status.HTTP_200_OK)
def remove_favorite(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing_fav = (
        db.query(models.UserFavorite)
        .filter(
            models.UserFavorite.user_id == current_user.id,
            models.UserFavorite.property_id == property_id,
        )
        .first()
    )

    if existing_fav:
        db.delete(existing_fav)
        db.commit()

    return {"message": "Property removed from favorites", "property_id": property_id}
