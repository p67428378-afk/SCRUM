from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.user import User
from server.schemas.user import UserResponse, UserCreate, UserUpdateRole
from server.routers.auth import check_role, get_password_hash

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists"
        )

    valid_roles = ["Administrator", "Manager", "Receptionist"]
    if user_in.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role specified. Must be one of {valid_roles}",
        )

    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username, hashed_password=hashed_password, role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/{user_id}/role", response_model=UserResponse)
def change_user_role(
    user_id: str,
    role_update: UserUpdateRole,
    db: Session = Depends(get_db),
    current_user=Depends(check_role(["Administrator"])),
):
    valid_roles = ["Administrator", "Manager", "Receptionist"]
    if role_update.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role specified. Must be one of {valid_roles}",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return user
