from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server import models, schemas
from server.database import get_db
from server.app.services import loyalty_service

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=List[schemas.CustomerResponse])
def list_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Customer).offset(skip).limit(limit).all()


@router.post(
    "", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED
)
def create_customer(cust_in: schemas.CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Customer).filter_by(email=cust_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer with this email already exists",
        )

    customer = models.Customer(**cust_in.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter_by(id=customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found"
        )
    return customer


@router.patch("/{customer_id}", response_model=schemas.CustomerResponse)
def update_customer(
    customer_id: str, cust_in: schemas.CustomerUpdate, db: Session = Depends(get_db)
):
    customer = db.query(models.Customer).filter_by(id=customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found"
        )

    update_data = cust_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}/history", response_model=schemas.CustomerHistoryResponse)
def get_customer_history(customer_id: str, db: Session = Depends(get_db)):
    return loyalty_service.get_customer_history(db, customer_id)


@router.post(
    "/{customer_id}/loyalty/redeem", response_model=schemas.LoyaltyTransactionResponse
)
def redeem_loyalty_points(
    customer_id: str,
    redeem_in: schemas.LoyaltyRedeemRequest,
    db: Session = Depends(get_db),
):
    return loyalty_service.redeem_loyalty_points(
        db,
        customer_id=customer_id,
        points=redeem_in.points,
        description=redeem_in.description,
    )
