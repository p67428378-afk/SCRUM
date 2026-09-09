from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User
from server.schemas import (
    UserCreate,
    UserUpdate,
    UserLogin,
    UserResponse,
    TokenResponse,
    ErrorResponse,
)
from server.auth import (
    verify_password,
    create_access_token,
    get_current_active_user,
    get_current_admin_user,
)
from server import crud

router = APIRouter(prefix="/api/v1", tags=["auth"])


@router.post(
    "/auth/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        409: {"model": ErrorResponse, "description": "Email already registered"}
    },
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = crud.create_user(db, user_in)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/auth/login",
    response_model=TokenResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid email or password"}
    },
)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/auth/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Standard users cannot elevate their own role
    if current_user.role != "admin":
        user_update.role = None
    updated = crud.update_user(db, current_user.id, user_update)
    return updated


@router.get("/patrons", response_model=List[UserResponse])
def list_patrons(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/patrons/{patron_id}", response_model=UserResponse)
def get_patron(
    patron_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Patron can view own profile or admin can view any profile
    if current_user.role != "admin" and current_user.id != patron_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this patron profile",
        )
    patron = crud.get_user_by_id(db, patron_id)
    if not patron:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patron not found",
        )
    return patron


@router.put("/patrons/{patron_id}", response_model=UserResponse)
def update_patron_profile(
    patron_id: str,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Admin can update any patron, patron can only update self
    if current_user.role != "admin" and current_user.id != patron_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this patron profile",
        )
    if current_user.role != "admin":
        user_update.role = None  # prevent self-promotion

    updated = crud.update_user(db, patron_id, user_update)
    return updated
