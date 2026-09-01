from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.app.database import get_db
from server.app import models, schemas
from server.app.auth.utils import get_current_user, get_optional_current_user
from server.app.properties import crud, search

router = APIRouter(prefix="/api/v1/properties", tags=["properties"])


@router.get("", response_model=schemas.PropertyListResponse)
def get_properties(
    city: Optional[str] = Query(None),
    zip_code: Optional[str] = Query(None),
    neighborhood: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    radius: Optional[float] = Query(None),
    property_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    bedrooms: Optional[int] = Query(None),
    bathrooms: Optional[float] = Query(None),
    min_sqft: Optional[int] = Query(None),
    max_sqft: Optional[int] = Query(None),
    amenities: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    items, total = search.search_properties(
        db=db,
        city=city,
        zip_code=zip_code,
        neighborhood=neighborhood,
        q=q,
        latitude=latitude,
        longitude=longitude,
        radius=radius,
        property_type=property_type,
        status=status,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        min_sqft=min_sqft,
        max_sqft=max_sqft,
        amenities=amenities,
        sort_by=sort_by,
        skip=skip,
        limit=limit,
    )

    # Attach is_favorite flag if user is logged in
    fav_property_ids = set()
    if current_user:
        favs = (
            db.query(models.UserFavorite.property_id)
            .filter(models.UserFavorite.user_id == current_user.id)
            .all()
        )
        fav_property_ids = {f[0] for f in favs}

    result_items = []
    for prop in items:
        p_res = (
            schemas.PropertyResponse.model_validate(prop)
            if hasattr(schemas.PropertyResponse, "model_validate")
            else schemas.PropertyResponse.from_orm(prop)
        )
        p_res.is_favorite = prop.id in fav_property_ids
        result_items.append(p_res)

    return schemas.PropertyListResponse(
        items=result_items, total=total, skip=skip, limit=limit
    )


@router.get("/{id}", response_model=schemas.PropertyResponse)
def get_property_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    prop = crud.get_property_by_id(db, id)
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Property not found"
        )

    p_res = (
        schemas.PropertyResponse.model_validate(prop)
        if hasattr(schemas.PropertyResponse, "model_validate")
        else schemas.PropertyResponse.from_orm(prop)
    )
    if current_user:
        fav = (
            db.query(models.UserFavorite)
            .filter(
                models.UserFavorite.user_id == current_user.id,
                models.UserFavorite.property_id == id,
            )
            .first()
        )
        p_res.is_favorite = fav is not None

    return p_res


@router.post(
    "", response_model=schemas.PropertyResponse, status_code=status.HTTP_201_CREATED
)
def create_property(
    property_in: schemas.PropertyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Authorization: Any registered user can create a listing, or seller_agent/admin
    created = crud.create_property(db, property_in, owner_agent_id=current_user.id)
    return created


@router.put("/{id}", response_model=schemas.PropertyResponse)
def update_property(
    id: str,
    property_in: schemas.PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    updated = crud.update_property(db, id, property_in, current_user)
    return updated


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    crud.delete_property(db, id, current_user)
    return None


@router.post(
    "/{id}/images",
    response_model=schemas.PropertyImageResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_property_image(
    id: str,
    image_in: schemas.PropertyImageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    image = crud.add_property_image(
        db,
        property_id=id,
        image_url=image_in.image_url,
        display_order=image_in.display_order,
        current_user=current_user,
    )
    return image
