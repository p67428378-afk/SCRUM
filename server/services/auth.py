from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session
import bcrypt # Import bcrypt directly

from server.models.renter import Renter
from server.models.car_owner import CarOwner
from server.schemas.renter import RenterCreate, TokenData
from server.config import settings
import jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # bcrypt expects bytes
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    # Truncate password to 72 bytes as required by bcrypt
    # bcrypt.hashpw expects bytes
    hashed_password = bcrypt.hashpw(password.encode('utf-8')[:72], bcrypt.gensalt())
    return hashed_password.decode('utf-8') # Store as utf-8 string

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_renter_by_email(db: Session, email: str):
    return db.query(Renter).filter(Renter.email == email).first()

def get_car_owner_by_email(db: Session, email: str):
    return db.query(CarOwner).filter(CarOwner.email == email).first()

def register_renter(db: Session, renter: RenterCreate):
    hashed_password = get_password_hash(renter.password)
    db_renter = Renter(username=renter.username, email=renter.email, password_hash=hashed_password)
    db.add(db_renter)
    db.commit()
    db.refresh(db_renter)
    return db_renter
