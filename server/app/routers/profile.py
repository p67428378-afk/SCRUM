from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models import Student
from server.app.schemas import ProfileResponse, ProfileUpdateRequest
from server.app.auth import get_current_student

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(current_student: Student = Depends(get_current_student)):
    if not current_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found"
        )
    return current_student


@router.put("", response_model=ProfileResponse)
def update_profile(
    request: ProfileUpdateRequest,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    if not current_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found"
        )

    # Update fields if provided
    if request.phone_number is not None:
        current_student.phone_number = request.phone_number  # type: ignore
    if request.preferred_name is not None:
        current_student.preferred_name = request.preferred_name  # type: ignore
    if request.profile_picture_url is not None:
        current_student.profile_picture_url = request.profile_picture_url  # type: ignore

    db.commit()
    db.refresh(current_student)
    return current_student
