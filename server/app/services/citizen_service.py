from typing import Optional, List
from sqlalchemy.orm import Session
from server.app.models.citizen import Citizen
from server.app.schemas.citizen import CitizenCreate


class CitizenService:
    @staticmethod
    def create_citizen(db: Session, citizen_in: CitizenCreate) -> Citizen:
        db_citizen = Citizen(
            full_name=citizen_in.full_name,
            email=citizen_in.email,
            phone=citizen_in.phone,
            address=citizen_in.address,
        )
        db.add(db_citizen)
        db.commit()
        db.refresh(db_citizen)
        return db_citizen

    @staticmethod
    def get_citizen_by_id(db: Session, citizen_id: str) -> Optional[Citizen]:
        return db.query(Citizen).filter(Citizen.id == citizen_id).first()

    @staticmethod
    def get_citizen_by_email(db: Session, email: str) -> Optional[Citizen]:
        return db.query(Citizen).filter(Citizen.email == email).first()

    @staticmethod
    def get_citizens(db: Session, skip: int = 0, limit: int = 50) -> List[Citizen]:
        return db.query(Citizen).offset(skip).limit(limit).all()
