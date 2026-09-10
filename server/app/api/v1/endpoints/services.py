from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server import models, schemas
from server.database import get_db

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=List[schemas.ServiceResponse])
def list_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Service).offset(skip).limit(limit).all()


@router.post(
    "", response_model=schemas.ServiceResponse, status_code=status.HTTP_201_CREATED
)
def create_service(svc_in: schemas.ServiceCreate, db: Session = Depends(get_db)):
    svc = models.Service(**svc_in.model_dump())
    db.add(svc)
    db.commit()
    db.refresh(svc)
    return svc


@router.get("/{service_id}", response_model=schemas.ServiceResponse)
def get_service(service_id: str, db: Session = Depends(get_db)):
    svc = db.query(models.Service).filter_by(id=service_id).first()
    if not svc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Service not found"
        )
    return svc


@router.patch("/{service_id}", response_model=schemas.ServiceResponse)
def update_service(
    service_id: str, svc_in: schemas.ServiceUpdate, db: Session = Depends(get_db)
):
    svc = db.query(models.Service).filter_by(id=service_id).first()
    if not svc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Service not found"
        )
    update_data = svc_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(svc, field, value)
    db.commit()
    db.refresh(svc)
    return svc
