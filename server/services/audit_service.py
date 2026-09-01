from sqlalchemy.orm import Session
from server import models


def log_phi_access(
    db: Session,
    user_id: str,
    user_role: str,
    action: str,
    patient_id: str = None,
    ip_address: str = "127.0.0.1",
):
    try:
        log_entry = models.PHIAuditLog(
            user_id=user_id,
            user_role=user_role,
            action=action,
            patient_id=patient_id,
            ip_address=ip_address,
        )
        db.add(log_entry)
        db.commit()
    except Exception:
        db.rollback()
