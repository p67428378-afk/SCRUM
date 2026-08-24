from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import User
from server.schemas import UserLogin, Token, UserResponse
from server.auth import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials"
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )
