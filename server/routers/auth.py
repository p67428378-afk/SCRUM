from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas import renter as renter_schemas
from server.services import auth as auth_service
from server.config import settings
import jwt # Added import for jwt

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

@router.post("/register", response_model=renter_schemas.RenterInDB)
def register_user(renter: renter_schemas.RenterCreate, db: Session = Depends(get_db)):
    db_renter = auth_service.get_renter_by_email(db, email=renter.email)
    if db_renter:
        raise HTTPException(status_code=400, detail="Email already registered")
    return auth_service.register_renter(db=db, renter=renter)

@router.post("/token", response_model=renter_schemas.Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    renter = auth_service.get_renter_by_email(db, email=form_data.username) # Assuming username is email for login
    if not renter or not auth_service.verify_password(form_data.password, renter.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": renter.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = renter_schemas.TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    renter = auth_service.get_renter_by_email(db, email=token_data.username)
    if renter is None:
        raise credentials_exception
    return renter
