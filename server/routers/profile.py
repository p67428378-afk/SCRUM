from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User, ActorProfile
from server.schemas import ProfileUpdate, ProfileOut
from server.routers.auth import get_current_user, generate_slug

router = APIRouter(prefix="/api/v1/actors/profile", tags=["Actor Profile"])


@router.get("", response_model=ProfileOut)
def get_profile(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    profile = (
        db.query(ActorProfile).filter(ActorProfile.user_id == current_user.id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actor profile not found",
        )
    return profile


@router.put("", response_model=ProfileOut)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(ActorProfile).filter(ActorProfile.user_id == current_user.id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actor profile not found",
        )

    update_data = profile_in.model_dump(exclude_unset=True)

    if (
        "full_name" in update_data
        and update_data["full_name"]
        and update_data["full_name"] != profile.full_name
    ):
        profile.full_name = update_data["full_name"]
        profile.slug = generate_slug(profile.full_name, db)

    for field, value in update_data.items():
        if field != "full_name" and value is not None:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
