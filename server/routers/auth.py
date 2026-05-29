
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud, schemas
from server.database import get_db

router = APIRouter()

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_renter_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    crud.create_renter(db=db, user=user)
    # In a real app, you'd create a real JWT token here
    return {"access_token": "fake-jwt-token", "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_renter_by_email(db, email=user.email)
    if not db_user or db_user.password_hash != user.password + "notreallyhashed":
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    # In a real app, you'd create a real JWT token here
    return {"access_token": "fake-jwt-token", "token_type": "bearer"}
