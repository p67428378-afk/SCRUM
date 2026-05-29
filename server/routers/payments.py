
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.PaymentStatus)
def process_payment(payment: schemas.Payment, db: Session = Depends(get_db)):
    return crud.process_payment(db=db, payment=payment)
