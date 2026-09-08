import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User, Cart
from server.schemas import UserRegister, UserLogin, UserResponse, Token
from server.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_active_user,
)

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    new_user = User(
        id=user_id,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role="user",
        is_active=True,
        is_verified=True,
        created_at=now,
        updated_at=now,
    )
    db.add(new_user)
    db.flush()

    # Create associated cart for user
    cart = Cart(
        id=str(uuid.uuid4()), user_id=new_user.id, created_at=now, updated_at=now
    )
    db.add(cart)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        data={"sub": new_user.id, "role": new_user.role, "email": new_user.email}
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=Token)
async def login(
    request: Request, user_in: Optional[UserLogin] = None, db: Session = Depends(get_db)
):
    # Support both JSON payload and form-data (OAuth2 format)
    email = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            pass
    elif (
        "application/x-www-form-urlencoded" in content_type
        or "multipart/form-data" in content_type
    ):
        form = await request.form()
        email = form.get("username") or form.get("email")
        password = form.get("password")

    if not email and user_in:
        email = user_in.email
        password = user_in.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/username and password are required",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account"
        )

    # Ensure user has a cart
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(
            id=str(uuid.uuid4()),
            user_id=user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(cart)
        db.commit()

    access_token = create_access_token(
        data={"sub": user.id, "role": user.role, "email": user.email}
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return UserResponse.model_validate(current_user)
