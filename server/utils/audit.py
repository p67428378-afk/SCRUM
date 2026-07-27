import datetime
import json
import logging

logger = logging.getLogger("audit")

# For testing purposes, we can store audit logs in memory
audit_logs = []
_test_db_session = None


def clear_audit_logs():
    audit_logs.clear()


def log_event(
    event_type: str,
    user_id: str | None = None,
    username: str | None = None,
    source_ip: str | None = None,
    user_agent: str | None = None,
    channel: str | None = None,
    reason: str | None = None,
    severity: str = "INFO",
    details: dict | None = None,
):
    payload = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "username": username,
        "source_ip": source_ip,
        "user_agent": user_agent,
        "channel": channel,
        "reason": reason,
        "severity": severity,
        "details": details or {},
    }

    logger.info(json.dumps(payload))
    audit_logs.append(payload)

    # Persist to database
    try:
        import uuid

        from server.models.banking import AuditLog

        db_log = AuditLog(
            id=uuid.uuid4(),
            event_type=event_type,
            actor=username or user_id or "system",
            resource=channel or "api",
            ip_address=source_ip or "127.0.0.1",
            status="success" if severity == "INFO" else "failed",
            details={
                "user_id": user_id,
                "username": username,
                "user_agent": user_agent,
                "reason": reason,
                "severity": severity,
                **(details or {}),
            },
        )

        if _test_db_session is not None:
            _test_db_session.add(db_log)
            _test_db_session.flush()
        else:
            from server.database import SessionLocal

            db = SessionLocal()
            try:
                db.add(db_log)
                db.commit()
            finally:
                db.close()
    except Exception:
        pass
