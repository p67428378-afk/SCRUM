from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import User, UserProfile
from server.schemas import ProfileResponse, ProfileUpdateRequest
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/profile", tags=["Profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    profile = (
        db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "full_name": profile.full_name,
        "phone_number": current_user.phone_number,
        "address": profile.address,
        "alert_on_transfer": profile.alert_on_transfer,
        "alert_on_login": profile.alert_on_login,
        "alert_threshold": profile.alert_threshold,
    }


@router.put("", response_model=ProfileResponse)
def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Update User fields
    if req.email is not None:
        # Check if email already exists for another user
        existing_user = (
            db.query(User)
            .filter(User.email == req.email, User.id != current_user.id)
            .first()
        )
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = req.email

    if req.phone_number is not None:
        current_user.phone_number = req.phone_number

    # Update UserProfile fields
    if req.full_name is not None:
        profile.full_name = req.full_name

    if req.address is not None:
        profile.address = req.address

    if req.alert_on_transfer is not None:
        profile.alert_on_transfer = req.alert_on_transfer

    if req.alert_on_login is not None:
        profile.alert_on_login = req.alert_on_login

    if req.alert_threshold is not None:
        profile.alert_threshold = req.alert_threshold

    db.commit()

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "full_name": profile.full_name,
        "phone_number": current_user.phone_number,
        "address": profile.address,
        "alert_on_transfer": profile.alert_on_transfer,
        "alert_on_login": profile.alert_on_login,
        "alert_threshold": profile.alert_threshold,
    }
