import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from server.models import PHIAuditLog


def log_phi_access(
    db: Session,
    user_id: str,
    user_role: str,
    action: str,
    patient_id: Optional[str] = None,
    ip_address: str = "127.0.0.1",
) -> PHIAuditLog:
    audit_log = PHIAuditLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        user_role=user_role,
        action=action,
        patient_id=patient_id,
        ip_address=ip_address,
        timestamp=datetime.utcnow(),
    )
    db.add(audit_log)
    try:
        db.commit()
        db.refresh(audit_log)
    except Exception:
        db.rollback()
    return audit_log
