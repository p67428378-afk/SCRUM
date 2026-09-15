from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from server.models import AuditLog


def log_audit_event(
    db: Session,
    tenant_id: str,
    action: str,
    entity_type: str,
    actor_id: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    audit_entry = AuditLog(
        tenant_id=tenant_id,
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details or {},
        ip_address=ip_address,
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry


def get_tenant_audit_logs(
    db: Session,
    tenant_id: str,
    skip: int = 0,
    limit: int = 50,
) -> List[AuditLog]:
    return (
        db.query(AuditLog)
        .filter(AuditLog.tenant_id == tenant_id)
        .order_by(AuditLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
