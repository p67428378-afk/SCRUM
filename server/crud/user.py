
from sqlalchemy.orm import Session
from server.models.user import Renter, CarOwner
from server.schemas.user import UserCreate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    return db.query(Renter).filter(Renter.email == email).first() or \
           db.query(CarOwner).filter(CarOwner.email == email).first()

def create_renter(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = Renter(email=user.email, username=user.username, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_car_owner(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = CarOwner(email=user.email, username=user.username, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
