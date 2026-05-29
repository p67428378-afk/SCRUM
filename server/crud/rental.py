
from sqlalchemy.orm import Session
from server.models.rental import Rental
from server.schemas.rental import RentalCreate
from uuid import UUID

def create_rental(db: Session, rental: RentalCreate):
    db_rental = Rental(**rental.dict())
    db.add(db_rental)
    db.commit()
    db.refresh(db_rental)
    return db_rental

def get_rental(db: Session, rental_id: UUID):
    return db.query(Rental).filter(Rental.rental_id == rental_id).first()
