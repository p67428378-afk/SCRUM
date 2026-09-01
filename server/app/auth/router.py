from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.app.database import get_db
from server.app import models, schemas
from server.app.auth.utils import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=schemas.Token, status_code=201)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user with email exists
    existing_user = (
        db.query(models.User).filter(models.User.email == user_in.email).first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    user = models.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "buyer",
        phone_number=user_in.phone_number,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    user_res = (
        schemas.UserResponse.model_validate(user)
        if hasattr(schemas.UserResponse, "model_validate")
        else schemas.UserResponse.from_orm(user)
    )
    return schemas.Token(access_token=access_token, token_type="bearer", user=user_res)


@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    user_res = (
        schemas.UserResponse.model_validate(user)
        if hasattr(schemas.UserResponse, "model_validate")
        else schemas.UserResponse.from_orm(user)
    )
    return schemas.Token(access_token=access_token, token_type="bearer", user=user_res)


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
