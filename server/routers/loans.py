
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud, schemas
from server.database import get_db
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=schemas.Loan)
def create_loan(loan: schemas.LoanCreate, db: Session = Depends(get_db)):
    return crud.create_loan(db=db, loan=loan)

@router.put("/{loan_id}/return", response_model=schemas.Loan)
def return_loan(loan_id: UUID, db: Session = Depends(get_db)):
    db_loan = crud.return_loan(db, loan_id=loan_id)
    if db_loan is None:
        raise HTTPException(status_code=404, detail="Loan not found")
    return db_loan
