from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from server.app.database import get_db
from server.app.models import User
from server.app.schemas import UserRegister, UserLogin, UserOut, TokenOut
from server.app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication & Devotees"])


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    if not user_in.email and not user_in.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either email or phone number must be provided for registration",
        )

    # Check for existing email or phone
    query_conditions = []
    if user_in.email:
        query_conditions.append(User.email == user_in.email)
    if user_in.phone:
        query_conditions.append(User.phone == user_in.phone)

    existing_user = db.query(User).filter(or_(*query_conditions)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A devotee with this email or phone number is already registered",
        )

    db_user = User(
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role="Devotee",
        preferred_language=user_in.preferred_language or "Hindi",
        address=user_in.address,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    access_token = create_access_token(data={"sub": db_user.id, "role": db_user.role})
    return TokenOut(access_token=access_token, token_type="bearer", user=db_user)


@router.post("/login", response_model=TokenOut)
def login_user(login_in: UserLogin, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(
            or_(User.email == login_in.identifier, User.phone == login_in.identifier)
        )
        .first()
    )

    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/phone or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated"
        )

    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    return TokenOut(access_token=access_token, token_type="bearer", user=user)


@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user
