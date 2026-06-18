from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models import Guide
from server.app.schemas import LoginRequest, LoginResponse
from server.app.auth import verify_password, create_access_token

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    guide = db.query(Guide).filter(Guide.email == login_data.email).first()
    if not guide or not verify_password(login_data.password, guide.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": guide.guide_id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "guide": {"guide_id": guide.guide_id, "name": guide.name, "email": guide.email},
    }
