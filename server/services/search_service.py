from typing import Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from server import models
from server.services.audit_service import log_phi_access


def search_patients(
    db: Session,
    query: str = "",
    gender: str = None,
    skip: int = 0,
    limit: int = 20,
    current_user: models.User = None,
) -> Tuple[List[models.Patient], int]:
    db_query = db.query(models.Patient)

    if query:
        q = f"%{query.strip()}%"
        db_query = db_query.filter(
            or_(
                models.Patient.full_name.ilike(q),
                models.Patient.patient_code.ilike(q),
                models.Patient.contact_number.ilike(q),
                models.Patient.date_of_birth.ilike(q),
            )
        )

    if gender:
        db_query = db_query.filter(models.Patient.gender == gender)

    total = db_query.count()
    items = (
        db_query.order_by(models.Patient.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    if current_user:
        log_phi_access(
            db,
            user_id=current_user.email,
            user_role=current_user.role,
            action="SEARCH",
            patient_id=None,
        )

    return items, total
