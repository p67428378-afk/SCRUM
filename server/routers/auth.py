from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from server import models, schemas
from server.database import get_db
from server.security import (
    verify_password,
    get_password_hash,
    create_access_token,
)
from server.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = (
        db.query(models.User).filter(models.User.email == user_in.email).first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = models.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
async def login(
    request: Request,
    db: Session = Depends(get_db),
):
    email = None
    password = None

    try:
        body = await request.json()
        if isinstance(body, dict):
            email = body.get("email") or body.get("username")
            password = body.get("password")
    except Exception:
        pass

    if not email or not password:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required",
        )

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    access_token = create_access_token(
        data={
            "sub": user.id,
            "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        }
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=schemas.Token)
def refresh_token(current_user: models.User = Depends(get_current_user)):
    access_token = create_access_token(
        data={
            "sub": current_user.id,
            "role": current_user.role.value
            if hasattr(current_user.role, "value")
            else str(current_user.role),
        }
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": current_user,
    }
