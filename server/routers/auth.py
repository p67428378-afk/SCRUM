import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User, ActorProfile
from server.schemas import UserRegister, UserLogin, Token, UserOut, ProfileOut
from server.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)


def generate_slug(full_name: str, db: Session) -> str:
    base_slug = re.sub(r"[^a-z0-9]+", "-", full_name.lower()).strip("-")
    if not base_slug:
        base_slug = "actor"
    slug = base_slug
    counter = 1
    while db.query(ActorProfile).filter(ActorProfile.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role="actor",
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    slug = generate_slug(user_in.full_name, db)
    profile = ActorProfile(
        user_id=user.id,
        full_name=user_in.full_name,
        slug=slug,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user),
        "profile": ProfileOut.model_validate(profile),
    }


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    profile = (
        db.query(ActorProfile).filter(ActorProfile.user_id == current_user.id).first()
    )
    return {
        "user": UserOut.model_validate(current_user),
        "profile": ProfileOut.model_validate(profile) if profile else None,
    }
