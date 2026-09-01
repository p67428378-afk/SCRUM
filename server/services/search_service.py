from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, cast, String
from server.models import Patient


def search_patients(
    db: Session,
    query: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    gender: Optional[str] = None,
) -> Tuple[int, List[Patient]]:
    q = db.query(Patient)

    if gender and gender.strip():
        q = q.filter(Patient.gender.ilike(gender.strip()))

    if query and query.strip():
        search_str = f"%{query.strip()}%"
        q = q.filter(
            or_(
                Patient.full_name.ilike(search_str),
                Patient.patient_code.ilike(search_str),
                Patient.contact_number.ilike(search_str),
                Patient.email.ilike(search_str),
                Patient.ssn.ilike(search_str),
                Patient.id.ilike(search_str),
                cast(Patient.date_of_birth, String).ilike(search_str),
            )
        )

    total = q.count()
    items = q.order_by(desc(Patient.created_at)).offset(skip).limit(limit).all()

    return total, items
