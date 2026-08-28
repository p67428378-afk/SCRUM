from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.models import User, UserActivityLog
from server.schemas.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
)
from server.dependencies.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)
from server.services.billing_analytics import record_user_login_event

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def register(user_data: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == str(user_data.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    new_user = User(
        email=str(user_data.email),
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(new_user),
    )


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(user_data: UserLoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == str(user_data.email)).first()
    if not user or not verify_password(user_data.password, str(user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log = UserActivityLog(
        user_id=str(user.id),
        activity_type="USER_LOGIN",
        endpoint=request.url.path,
        ip_address=client_ip,
        details="Successful login",
    )
    db.add(log)
    db.commit()

    # Record login event in billing analytics
    try:
        record_user_login_event(str(user.id), db)
    except Exception:
        pass

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token, token_type="bearer", user=UserResponse.from_orm(user)
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
