import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from server.app import models, schemas


def get_property_by_id(db: Session, property_id: str) -> Optional[models.Property]:
    return db.query(models.Property).filter(models.Property.id == property_id).first()


def create_property(
    db: Session, property_in: schemas.PropertyCreate, owner_agent_id: str
) -> models.Property:
    db_property = models.Property(
        id=str(uuid.uuid4()),
        title=property_in.title,
        description=property_in.description,
        property_type=property_in.property_type,
        status=property_in.status or "Active",
        price=property_in.price,
        bedrooms=property_in.bedrooms,
        bathrooms=property_in.bathrooms,
        square_feet=property_in.square_feet,
        address_street=property_in.address_street,
        city=property_in.city,
        state=property_in.state,
        zip_code=property_in.zip_code,
        latitude=property_in.latitude,
        longitude=property_in.longitude,
        owner_agent_id=owner_agent_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(db_property)
    db.commit()
    db.refresh(db_property)

    # Attach images if provided
    if property_in.images:
        for index, img_url in enumerate(property_in.images):
            img = models.PropertyImage(
                id=str(uuid.uuid4()),
                property_id=db_property.id,
                image_url=img_url,
                display_order=index,
                created_at=datetime.utcnow(),
            )
            db.add(img)

    # Attach amenities if provided
    if property_in.amenities:
        for name in property_in.amenities:
            amenity = (
                db.query(models.Amenity)
                .filter((models.Amenity.name == name) | (models.Amenity.id == name))
                .first()
            )
            if not amenity:
                amenity = models.Amenity(id=str(uuid.uuid4()), name=name)
                db.add(amenity)
                db.commit()
                db.refresh(amenity)
            db_property.amenities.append(amenity)

    db.commit()
    db.refresh(db_property)
    return db_property


def update_property(
    db: Session,
    property_id: str,
    property_in: schemas.PropertyUpdate,
    current_user: models.User,
) -> models.Property:
    db_property = get_property_by_id(db, property_id)
    if not db_property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Property not found"
        )

    # Authorization check: only listing owner or admin can update
    if db_property.owner_agent_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this listing",
        )

    update_data = (
        property_in.model_dump(exclude_unset=True)
        if hasattr(property_in, "model_dump")
        else property_in.dict(exclude_unset=True)
    )

    # Handle amenities separately
    if "amenities" in update_data and update_data["amenities"] is not None:
        amenity_names = update_data.pop("amenities")
        db_property.amenities.clear()
        for name in amenity_names:
            amenity = (
                db.query(models.Amenity)
                .filter((models.Amenity.name == name) | (models.Amenity.id == name))
                .first()
            )
            if not amenity:
                amenity = models.Amenity(id=str(uuid.uuid4()), name=name)
                db.add(amenity)
                db.commit()
                db.refresh(amenity)
            db_property.amenities.append(amenity)

    # Handle images separately if provided
    if "images" in update_data and update_data["images"] is not None:
        image_urls = update_data.pop("images")
        db.query(models.PropertyImage).filter(
            models.PropertyImage.property_id == property_id
        ).delete()
        for index, img_url in enumerate(image_urls):
            img = models.PropertyImage(
                id=str(uuid.uuid4()),
                property_id=db_property.id,
                image_url=img_url,
                display_order=index,
                created_at=datetime.utcnow(),
            )
            db.add(img)

    for field, value in update_data.items():
        setattr(db_property, field, value)

    db_property.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_property)
    return db_property


def delete_property(db: Session, property_id: str, current_user: models.User) -> bool:
    db_property = get_property_by_id(db, property_id)
    if not db_property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Property not found"
        )

    if db_property.owner_agent_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing",
        )

    db.delete(db_property)
    db.commit()
    return True


def add_property_image(
    db: Session,
    property_id: str,
    image_url: str,
    display_order: int,
    current_user: models.User,
) -> models.PropertyImage:
    db_property = get_property_by_id(db, property_id)
    if not db_property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Property not found"
        )

    if db_property.owner_agent_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this listing",
        )

    image = models.PropertyImage(
        id=str(uuid.uuid4()),
        property_id=property_id,
        image_url=image_url,
        display_order=display_order,
        created_at=datetime.utcnow(),
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image
